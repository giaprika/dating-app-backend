class ResponseUtil {
  success(data, message = "Success", statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  error(message = "Error", statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }

  pagination(data, page, limit, total) {
    return {
      success: true,
      statusCode: 200,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new ResponseUtil();
