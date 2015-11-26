exports.post = function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) return next(err);
        res.redirect('/');
    });
};