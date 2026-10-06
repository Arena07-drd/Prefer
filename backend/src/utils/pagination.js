export const getPaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;
  
  let sort = {};
  if (query.sort) {
    const sortField = query.sort.startsWith('-') ? query.sort.substring(1) : query.sort;
    const sortOrder = query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    sort = { createdAt: -1 }; // default sort
  }

  return { page, limit, skip, sort };
};

export const getPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};
