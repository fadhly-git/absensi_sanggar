import CreateEditEvent from './create';

interface EditEventProps {
  eventId: string;
}

export default function EditEvent({ eventId }: EditEventProps) {
  return <CreateEditEvent eventId={eventId} />;
}
