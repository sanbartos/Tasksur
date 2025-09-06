// utils/pagination.ts
export function parsePaginationParams(page, limit) {
    const pageNumber = Math.max(parseInt(page || '1'), 1);
    const limitNumber = Math.min(Math.max(parseInt(limit || '10'), 1), 100);
    return { pageNumber, limitNumber };
}
