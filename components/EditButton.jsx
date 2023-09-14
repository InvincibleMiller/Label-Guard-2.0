import Link from "next/link";

export default function EditButton({ url }) {
  return (
    <Link href={url} className="btn btn-link">
      Edit
    </Link>
  );
}
