/** Shown while a page is on its way: the bolt alone, breathing. */
export default function Loading() {
  return (
    <div role="status" aria-label="Instanix" className="grid min-h-dvh place-items-center">
      <img src="/brand/mark.webp" alt="" width={223} height={256} className="ix-loader-mark" />
    </div>
  );
}
