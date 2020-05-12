import path from 'path';
class AddOn {
    async getModules (addOns) {
        const ADD_ON_ROUTE = path.resolve(`${path.dirname(__dirname)}/add-ons/${addOns}/routes/index.js`);
        try {
            let addOns = null;
            await Promise.all([
                import(ADD_ON_ROUTE),
            ]).then(([ImportExt]) => {
                addOns = ImportExt;
            });
            return addOns;
        } catch (err) {
            console.error(`Fail to get add-on routes at: ${ADD_ON_ROUTE}`, err);
            return null;
        }
    }
}

export default new AddOn();