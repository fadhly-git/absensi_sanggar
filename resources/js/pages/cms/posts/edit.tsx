import CreateEditPost from './create';

interface EditPostProps {
  postId: string;
}

export default function EditPost({ postId }: EditPostProps) {
  return <CreateEditPost postId={postId} />;
}
