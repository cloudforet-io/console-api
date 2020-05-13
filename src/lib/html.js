import ejs from 'ejs';
import path from "path";

const setHtmlEjs = async (app) => {
    const directPath = path.dirname(__dirname) + '/add-ons/html/views';
    app.set('views', directPath);
    app.set('view engine', 'ejs');
    app.engine('html', ejs.renderFile);
};

export {
    setHtmlEjs
};