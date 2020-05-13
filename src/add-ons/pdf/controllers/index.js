import file from '@lib/file';
import _ from 'lodash';
import { getDynamicData, getPDFOption, setPDFResponseHeader} from '@/add-ons/pdf/lib/pdf';
import { html2PDFconfig } from '@/add-ons/pdf/lib/html2pdf';
import artTemplate from 'art-template';
import path from 'path';
import pdf from 'html-pdf';
import { CanvasRenderService } from 'chartjs-node-canvas';

const pdfActionContextBuilder = (actionContexts) => {
    const callBack = _.get(actionContexts, 'callBack', null);
    const serviceClient = _.get(actionContexts, 'clients', null);
    const redisParameters = _.get(actionContexts, 'redisParam', null);
    const authInfo = _.get(actionContexts, 'authenticationInfo', null);
    const protocol = _.get(actionContexts, 'protocol', null);

    if(!callBack || !serviceClient || !redisParameters || !authInfo || !protocol){
        throw new Error('action Context has not been set');
    }

    return  { callBack,
        data: { 
            func: getPDFData,
            param: [serviceClient, redisParameters.req_body, subOptionBuilder({ redisParameters, authInfo })]
        },
        buffer: {
            func: createPDF,
            param: [protocol.res],
            additionalData:true
        }
    };
};

const exportPDF = async (request) => {
    const redisKey = file.generateRandomKey();
    file.setFileParamsOnRedis(redisKey, request.body, request.originalUrl);
    const excelLink = file.getFileRequestURL(request, redisKey);
    return excelLink;
};

const sampleChartjs = [
    { key: 'bar_chart_url',
        config_data: {
            type: 'bar',
            data: {
                labels: ['NY', 'NJ', 'MA', 'TX', 'CA', 'WA'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }
    },
    { key: 'doughnut_chart_url',
        config_data: {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [10, 20, 30]
                }],

                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Red',
                    'Yellow',
                    'Blue'
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            },
            options: {}
        }
    },
    { key: 'horizontal_chart_url',
        config_data: {
            type: 'horizontalBar',
            data: {
                labels: ['NY', 'NJ', 'MA', 'TX', 'CA', 'WA'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }
    }
];

const mkChart = async (configuration) => {
    const chartBufferObject = {};
    const promises = configuration.map(async (chart) => {
        const canvasRenderService = new CanvasRenderService(400, 400);
        const bufferData = await canvasRenderService.renderToBuffer(chart.config_data);
        const imgURL = `data:image/jpeg;base64,${bufferData.toString('base64')}`;
        chartBufferObject[chart.key] = imgURL;

    });
    await Promise.all(promises);
    return chartBufferObject;
};


const subOptionBuilder = (subOptionObject) => {
    const current_page = _.get(subOptionObject,'redisParameters.req_body.art-template.options.current_page', false);
    const optionInfo = _.get(subOptionObject,'redisParameters.art-template.options.timezone', null);
    const authInfo = _.get(subOptionObject,'authInfo', null);
    authInfo['current_page'] = current_page;

    const subOptions = optionInfo ? {
        current_page,
        user_type: authInfo.user_type,
        timezone: optionInfo
    } : authInfo;

    return subOptions;
};

const getPDFData = async (serviceClient, redis_param, subOptions) => {
    const sourceURL = _.get(redis_param,'source.data.url', null);
    const sourceParam = _.get(redis_param,'source.data.param', null);
    const template = _.get(redis_param,'template', null);

    if(!sourceURL|| !sourceParam || !template) {
        const errorMSG = 'Unsupported api type.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }

    if(!subOptions.hasOwnProperty('timezone')){
        const user_type = _.get(subOptions, 'user_type', 'USER');
        const timeZoneReqBody =  {
            client: 'identity',
            url: user_type === 'DOMAIN_OWNER' ? '/identity/domain-owner/get' : '/identity/user/get',
            body: {
                user_id: subOptions.user_id
            }
        };
        const userInfo = await getDynamicData(serviceClient, timeZoneReqBody);
        if(userInfo){
            let timezone = null;
            let userTimezone = _.get(userInfo, 'data.timezone', 'UTC');
            if(userTimezone.indexOf('+') > -1 || userTimezone.indexOf('-') > -1){
                timezone = 'UTC';
            }

            template.options['timezone']= timezone ? timezone : userTimezone;
        }
    }

    if (!_.get(subOptions, 'current_page') && !_.isEmpty(sourceParam.query)) {
        delete sourceParam.query.page;
    }

    /*const selectedData = await getDynamicData(serviceClient, {
        client: sourceURL.substr(0,sourceURL.indexOf('/')),
        url: sourceURL,
        body: sourceParam
    });

    const response = _.get(selectedData, 'data.results', null);

    if(response === null) {
        const errorMSG = 'Unsupported api.(reason= data form doesn\'t support file format.)';
        this.fileError(errorMSG);
    }*/

    return {
        source_data: null,
        source_template: template
    };
};



const  getHTMLTemplate = (imageBuffers)  =>  {
    const students = [{name: 'Joy',
        email: 'joy@example.com',
        city: 'New York',
        country: 'USA'},
    {name: 'John',
        email: 'John@example.com',
        city: 'San Francisco',
        country: 'USA'},
    {name: 'Clark',
        email: 'Clark@example.com',
        city: 'Seattle',
        country: 'USA'},
    {name: 'Watson',
        email: 'Watson@example.com',
        city: 'Boston',
        country: 'USA'},
    {name: 'Tony',
        email: 'Tony@example.com',
        city: 'Los Angels',
        country: 'USA'
    }];

    const gchart = {
        g1_url: 'https://chart.googleapis.com/chart?cht=p3&chd=t:60,40,10,10&chs=250x100&chl=NY|MA|WA|TX',
        g2_url: 'https://chart.googleapis.com/chart?cht=bvg&chs=250x150&chd=s:Monkeys&chxt=x,y&chxs=0,ff0000,12,0,lt|1,0000ff,10,1,lt'
    };

    const pdfData = {
        students,
        ...imageBuffers,
        ...gchart
    };

    /*const htmlTemplateART = artTemplate(path.join(__dirname, '../../../add-ons/html/views/pdfs', 'products.art'), pdfData);
    console.log('##########################htmlTemplateART########################', htmlTemplateART);
    let htmlTemplate = null;
    ejs.renderFile(path.join(__dirname, '../../../add-ons/html/views/chart', 'bar-chart.ejs'), {}, async (err, data) => {
        htmlTemplate = data;
    });
    console.log('##########################htmlTemplate########################', htmlTemplate);*/
    const htmlTemplate = artTemplate(path.join(__dirname, '../../../add-ons/pdf/art-template/sample', 'sample-template.art'), pdfData);
    return htmlTemplate;
};

const  getHTMLtoPDFBuffers = (content, options)  =>  {
    return new Promise((resolve, reject) => {
        pdf.create(content, options).toBuffer((error, buffer) => {
            if (!error) resolve(buffer);
            else reject(error);
        });

    });
};

const writeBuffer = async (res, options) => {
    const chartJSObject = await mkChart(sampleChartjs);
    const html = getHTMLTemplate(chartJSObject);
    return getHTMLtoPDFBuffers(html, options);
};

const createPDF = async (pdfData, response) => {
    const template = _.get(pdfData,'source_template');
    const options = getPDFOption(template);
    setPDFResponseHeader(response, options.file_name);
    const pdfBuffer = await writeBuffer(response, html2PDFconfig);
    return pdfBuffer;
};

export {
    pdfActionContextBuilder,
    exportPDF,
    getPDFData,
    createPDF
};
