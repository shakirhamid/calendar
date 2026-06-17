import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { CalendarEvent, seedEvents } from '@/pages/api/events-store';

const dataDirectory = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDirectory, 'events.json');
let mutationQueue: Promise<unknown> = Promise.resolve();

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(seedEvents, null, 2), 'utf8');
  }
}

async function writeEvents(events: CalendarEvent[]) {
  await ensureStore();
  await fs.writeFile(dataFilePath, JSON.stringify(events, null, 2), 'utf8');
}

function runSerializedMutation<T>(operation: () => Promise<T>) {
  const nextRun = mutationQueue.then(operation, operation);
  mutationQueue = nextRun.then(
    () => undefined,
    () => undefined
  );
  return nextRun;
}

function createUniqueEventId(existingEvents: CalendarEvent[], preferredId?: string) {
  if (preferredId && !existingEvents.some((event) => event.id === preferredId)) {
    return preferredId;
  }

  let nextId = randomUUID();
  while (existingEvents.some((event) => event.id === nextId)) {
    nextId = randomUUID();
  }

  return nextId;
}

export async function readEvents() {
  await ensureStore();
  const raw = await fs.readFile(dataFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(parsed) ? parsed : seedEvents;
  } catch {
    await writeEvents(seedEvents);
    return seedEvents;
  }
}

export async function createEvent(input: Partial<CalendarEvent>) {
  return runSerializedMutation(async () => {
    const events = await readEvents();
    const now = new Date().toISOString();

    const newEvent: CalendarEvent = {
      id: createUniqueEventId(events, input.id),
      title: input.title || 'Untitled',
      date: input.date || now,
      time: input.time || '00:00',
      description: input.description || '',
      color: input.color || '#1976d2',
      sendNotification: Boolean(input.sendNotification),
      isTask: input.isTask ?? true,
      createdAt: now,
      updatedAt: now,
    };

    events.push(newEvent);
    await writeEvents(events);
    return newEvent;
  });
}

export async function updateEvent(eventId: string, updates: Partial<CalendarEvent>) {
  return runSerializedMutation(async () => {
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === eventId);

    if (index === -1) {
      return null;
    }

    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...updates,
      id: events[index].id,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    await writeEvents(events);
    return updatedEvent;
  });
}

export async function deleteEvent(eventId: string) {
  return runSerializedMutation(async () => {
    const events = await readEvents();
    const index = events.findIndex((event) => event.id === eventId);

    if (index === -1) {
      return null;
    }

    const [deletedEvent] = events.splice(index, 1);
    await writeEvents(events);
    return deletedEvent;
  });
}

export async function clearEvents() {
  await runSerializedMutation(async () => {
    await writeEvents([]);
  });
}
