import Image from "next/image";

// Figure block for product screenshots inside blog post MDX bodies.
// Used as an explicit <PostImage> tag (mapped via the MDXRemote
// `components` prop in blog/[slug]/page.tsx) rather than markdown
// image syntax, so every placement carries real width/height and the
// page reserves the space before the image loads.
interface PostImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export function PostImage({ src, alt, width, height, caption }: PostImageProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 768px) 704px, 100vw"
        loading="lazy"
        className="h-auto w-full rounded-xl border border-border-default"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
