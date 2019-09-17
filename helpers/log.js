module.exports = function logger(string) {
    if (process.env.ENV === "production") {
        return null;
    }

    console.log(string);
}