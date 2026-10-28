import { test, expect } from '@playwright/test';
import { adminToken, bookingsForRoom, createRoom, guest, stayFrom } from '../../support/api';

test.describe('Guest booking UI', () => {
  test('a guest can book a room from the website and the owner sees the booking', async ({ page, request, baseURL }) => {
    // Known blocker on the hosted site, see "Bug report" in README. Fails loudly once it's fixed there.
    test.fail(
      baseURL?.includes('automationintesting.online') ?? false,
      'Hosted site returns 500 for GET /api/room/{id} (see README, Bug report)',
    );

    // Set up through the API (fast, no shared state), then exercise only the guest journey in the browser.
    const token = await adminToken(request);
    const roomid = await createRoom(request, token);
    const stay = stayFrom(600, 2);

    // Same URL the "Book now" button on the home page links to. The page renders nothing
    // until room details load, so assert on that call to make a failure say why.
    const roomDetails = page.waitForResponse(r => r.url().endsWith(`/api/room/${roomid}`));
    await page.goto(`/reservation/${roomid}?checkin=${stay.checkin}&checkout=${stay.checkout}`);
    const roomResponse = await roomDetails;
    expect(roomResponse.status(), `GET /api/room/${roomid} must succeed for the reservation page to render`).toBe(200);
    await page.locator('#doReservation').click();

    await page.getByPlaceholder('Firstname').fill(guest.firstname);
    await page.getByPlaceholder('Lastname').fill(guest.lastname);
    await page.getByPlaceholder('Email').fill(guest.email);
    await page.getByPlaceholder('Phone').fill(guest.phone);
    await page.getByRole('button', { name: 'Reserve Now' }).click();

    await expect(page.getByRole('heading', { name: 'Booking Confirmed' })).toBeVisible();
    await expect(page.getByText(`${stay.checkin} - ${stay.checkout}`)).toBeVisible();

    // A confirmation screen alone doesn't prove the booking was stored.
    const bookings = await bookingsForRoom(request, token, roomid);
    expect(bookings).toEqual([
      expect.objectContaining({ firstname: guest.firstname, lastname: guest.lastname, bookingdates: stay }),
    ]);
  });
});
