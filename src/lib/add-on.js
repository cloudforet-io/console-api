import path from 'path';
class AddOn {
    async getModules (addOns) {
        const ADD_ON = path.resolve(`${__dirname}/../add-ons/${addOns}/routes/index.js`);
        try {
            const singleAddon = await require(ADD_ON);
            return singleAddon;
        } catch (err) {
            console.error('Error occurred while get add-on routes!', err);
        }
    }
}

export default new AddOn();