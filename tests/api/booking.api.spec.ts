import { test, expect } from '@playwright/test';
import { adminToken, availableRoomIds, bookingsForRoom, createBooking, createRoom, guest, stayFrom } from '../../support/api';

test.describe('Booking API', () => {
  test('a guest can book a room once, and overlapping stays are rejected', async ({ request }) => {
    const token = await adminToken(request);
    const roomid = await createRoom(request, token);
    const stay = stayFrom(400, 3);

    const created = await createBooking(request, roomid, stay);
    expect(created.status()).toBe(201);
    const booking = await created.json();
    expect(booking).toMatchObject({ roomid, firstname: guest.firstname, lastname: guest.lastname, bookingdates: stay });

    // The admin view is what the B&B owner relies on, so check the booking landed there.
    const bookings = await bookingsForRoom(request, token, roomid);
    expect(bookings.map(b => b.bookingid)).toContain(booking.bookingid);

    // Double-booking is the costliest failure for a B&B: same dates, then a partial overlap.
    const sameDates = await createBooking(request, roomid, stay, { ...guest, firstname: 'Second' });
    expect(sameDates.status()).toBe(409);
    const overlap = await createBooking(request, roomid, stayFrom(401, 3), { ...guest, firstname: 'Third' });
    expect(overlap.status()).toBe(409);

    expect(await bookingsForRoom(request, token, roomid)).toHaveLength(1);
  });

  test('availability search hides a room for any stay that overlaps a booking', async ({ request }) => {
    // Known bug, see "Other issues" in README: only stays that fully cover the booking are
    // filtered out. test.fail() keeps CI green while the bug is open and fails loudly once it's fixed.
    test.fail(true, 'Availability search ignores partial overlaps (see README, Other issues)');

    const token = await adminToken(request);
    const roomid = await createRoom(request, token);
    const booked = stayFrom(500, 2); // nights of day 500 and 501
    expect((await createBooking(request, roomid, booked)).status()).toBe(201);

    const overlapping = {
      'same dates': stayFrom(500, 2),
      'starts the night before': stayFrom(499, 2),
      'starts mid-stay': stayFrom(501, 2),
      'shorter stay inside': stayFrom(500, 1),
      'wraps the booking': stayFrom(498, 6),
    };
    for (const [label, stay] of Object.entries(overlapping)) {
      expect.soft(await availableRoomIds(request, stay), `${label} ${stay.checkin}..${stay.checkout}`).not.toContain(roomid);
    }

    // Control: a stay starting on the checkout day doesn't overlap and must stay bookable.
    expect.soft(await availableRoomIds(request, stayFrom(502, 2)), 'stay starting on checkout day').toContain(roomid);
  });
});
