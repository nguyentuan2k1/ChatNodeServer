// Hàm hỗ trợ phân trang
class Pagination {
    static async paginate(find_query, total_query, page = 1, pageSize = 15) {
        pageSize = parseInt(pageSize);
        page     = parseInt(page);

        // Calculate the number of documents to skip
        const skip = (page - 1) * pageSize;
         
        // Fetch the documents with pagination
        let data = await find_query.skip(skip).limit(pageSize);;
    
        // Get the total count of documents in the collection
        const total = await total_query.countDocuments();

        const totalPages = Math.ceil(total / pageSize);

        return {
            currentPage : page,
            pageSize : pageSize,
            totalPages,
            total,
            data,
          };
    }
}
module.exports = Pagination;