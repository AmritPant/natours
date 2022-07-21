module.exports = function (controllerFunction) {
    return function (req, res, next) {
        controllerFunction(req, res, next).catch(err => next(err));
    };
};
