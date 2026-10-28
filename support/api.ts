import { APIRequestContext, expect } from '@playwright/test';
import { requiredEnv } from './env';

const ADMIN_USER = requiredEnv('ADMIN_USER');
const ADMIN_PASSWORD = requiredEnv('ADMIN_PASSWORD');

export type Stay = { checkin: string; checkout: string };

export type Guest = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
};

export const guest: Guest = {
  firstname: 'Quinn',
  lastname: 'Assurance',
  email: 'quinn.assurance@example.com',
  phone: '01234567890',
};

export async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/auth/login', {
    data: { username: ADMIN_USER, password: ADMIN_PASSWORD },
  });
  expect(res.status(), 'admin login').toBe(200);
  return (await res.json()).token;
}

export const authHeaders = (token: string) => ({ Cookie: `token=${token}` });

/**
 * Creates a room only this test knows about, so other users of the shared
 * instance can't collide with our bookings. POST /api/room doesn't return an
 * id, so we look the room up by its unique name.
 */
export async function createRoom(request: APIRequestContext, token: string): Promise<number> {
  const roomName = `QA-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const res = await request.post('/api/room', {
    headers: authHeaders(token),
    data: {
      roomName,
      type: 'Double',
      accessible: true,
      roomPrice: '120',
      features: ['WiFi', 'TV'],
      image: '/images/room2.jpg',
      description: 'Created by automated tests',
    },
  });
  expect(res.ok(), `create room: ${res.status()} ${await res.text()}`).toBeTruthy();

  const rooms = (await (await request.get('/api/room')).json()).rooms as { roomName: string; roomid: number }[];
  const room = rooms.find(r => r.roomName === roomName);
  expect(room, `room ${roomName} should be listed after creation`).toBeDefined();
  return room!.roomid;
}

export function createBooking(request: APIRequestContext, roomid: number, stay: Stay, who: Guest = guest) {
  return request.post('/api/booking', {
    data: { roomid, depositpaid: false, bookingdates: stay, ...who },
  });
}

export async function bookingsForRoom(request: APIRequestContext, token: string, roomid: number) {
  const res = await request.get(`/api/booking?roomid=${roomid}`, { headers: authHeaders(token) });
  expect(res.status(), 'list bookings').toBe(200);
  return (await res.json()).bookings as { bookingid: number; roomid: number; firstname: string; lastname: string; bookingdates: Stay }[];
}

export async function availableRoomIds(request: APIRequestContext, stay: Stay): Promise<number[]> {
  const res = await request.get(`/api/room?checkin=${stay.checkin}&checkout=${stay.checkout}`);
  expect(res.status(), 'availability search').toBe(200);
  return ((await res.json()).rooms as { roomid: number }[]).map(r => r.roomid);
}

/** A stay `nights` long starting `daysFromNow` days ahead, as YYYY-MM-DD. */
export function stayFrom(daysFromNow: number, nights: number): Stay {
  const day = (offset: number) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return { checkin: day(daysFromNow), checkout: day(daysFromNow + nights) };
}
