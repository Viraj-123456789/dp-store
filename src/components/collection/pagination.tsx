import Link from "next/link";

interface PaginationProps {
  basePath: string;
  page: number;
  pageCount: number;
}

/** Plain-text pager ("« Previous 1 2 Next »"), matching the unstyled reference. */
export function Pagination({ basePath, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) return null;

  const href = (target: number) => `${basePath}?page=${target}`;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="pb-[54px] text-center">
      {page > 1 && (
        <>
          <Link href={href(page - 1)} rel="prev">
            « Previous
          </Link>{" "}
        </>
      )}
      {pages.map((target) => (
        <span key={target}>
          {target === page ? (
            <span aria-current="page">{target}</span>
          ) : (
            <Link href={href(target)}>{target}</Link>
          )}{" "}
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} rel="next">
          Next »
        </Link>
      )}
    </nav>
  );
}
