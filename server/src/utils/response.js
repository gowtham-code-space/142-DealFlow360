const successResponse = (res, message, data = null) => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

const createdResponse = (res, message, data = null) => {
    return res.status(201).json({
        success: true,
        message,
        data
    });
};

const badRequestResponse = (res, message = 'Bad Request') => {
    return res.status(400).json({
        success: false,
        message
    });
};

const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return res.status(401).json({
        success: false,
        message
    });
};

const forbiddenResponse = (res, message = 'Forbidden') => {
    return res.status(403).json({
        success: false,
        message
    });
};

const notFoundResponse = (res, message = 'Resource Not Found') => {
    return res.status(404).json({
        success: false,
        message
    });
};

const conflictResponse = (res, message = 'Conflict') => {
    return res.status(409).json({
        success: false,
        message
    });
};

const validationErrorResponse = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors
    });
};

const internalServerErrorResponse = (res, message = 'Internal Server Error') => {
    return res.status(500).json({
        success: false,
        message
    });
};

const errorResponse = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    successResponse,
    createdResponse,
    badRequestResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    validationErrorResponse,
    internalServerErrorResponse,
    errorResponse
};
