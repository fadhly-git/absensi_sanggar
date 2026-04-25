import CreateEditGallery from './create';

interface EditGalleryProps {
  galleryId: string;
}

export default function EditGallery({ galleryId }: EditGalleryProps) {
  return <CreateEditGallery galleryId={galleryId} />;
}
