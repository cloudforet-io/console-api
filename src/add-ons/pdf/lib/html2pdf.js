const html2PDFconfig = {
    format: 'A4',
    orientation: 'portrait',
    paginationOffset: 1,
    zoomFactor: '1',
    header: {
        height: '45mm',
        contents: '<div style="text-align: center;">Author: DK</div>'
    },
    footer: {
        height: '28mm',
        contents: {
            first: 'Cover page',
            2: 'Second page', // Any page number is working. 1-based index
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: 'Last Page'
        }
    }
}

export {
    html2PDFconfig
};