import _ from 'lodash';
import ejs from 'ejs';
import { setDefaultOption } from '@/add-ons/html/lib/html';

const renderingTemplate = async (params, response) => {
    const defaultOption = setDefaultOption(params);
    response.render(defaultOption.path, defaultOption);
};

export {
    renderingTemplate
};
