import path from 'path';
class AddOn {
    async getModules (addOns) {
        
        const ADD_ON_ROUTE = path.resolve(`${__dirname}/../add-ons/${addOns}/routes/index.js`);
        try {
            const singleAddon = await require(ADD_ON_ROUTE);
            return singleAddon;
        } catch (err) {
            console.error(`Fail to get add-on routes at: ${ADD_ON_ROUTE}`, err);
            return null;
        }
    }
}

export default new AddOn();