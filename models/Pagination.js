// Hàm hỗ trợ phân trang
class Pagination {
    static async paginate(find_query, total_Query, page = 1, pageSize = 15) {        
        // Calculate the number of documents to skip
        const skip = (page - 1) * pageSize;
         
        // Fetch the documents with pagination
        const data = await find_query.skip(skip).limit(pageSize);
      
        // Get the total count of documents in the collection
        const total = await total_Query.countDocuments();

        const totalPages = Math.ceil(total / pageSize);

        return {
            currentPage : page,
            pageSize : parseInt(pageSize),
            totalPages,
            total,
            data,
          };
    }
}
module.exports = Pagination;