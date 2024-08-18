// Hàm hỗ trợ phân trang
class Pagination {
    static paginate(dataArray, page, pageSize = 15) {
        const total      = dataArray.length;
        const totalPages = Math.ceil(total / pageSize);
        const paginated  = dataArray.slice((page - 1) * pageSize, page * pageSize);
    
        return {
            total,
            totalPages,
            paginated,
            currentPage: page,
            pageSize
        };
    }
}
module.exports = Pagination;