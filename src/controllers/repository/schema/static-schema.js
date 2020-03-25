const schemas = [
    {
        schema_id: 'schema-185a0badd7',
        name: 'AWS Access Key',
        scheme_type: 'secret.Secret.data',
        fields: [ {
            type: 'str',
            is_required: true,
            key: 'aws_access_key_id',
            name: 'Access key ID'
        }, {
            type: 'str',
            is_required: true,
            key: 'aws_secret_access_key',
            name: 'Secret access key'
        },{
            is_required: true,
            key: 'region',
            name: 'AWS Region name',
            type: 'str'
        }]
    },
    {
        schema_id: 'schema-200a1b3ba1',
        name: 'GCP Credentials',
        scheme_type: 'secret.Secret.data',
        fields: [ {
            type: 'str',
            is_required: true,
            key: 'type',
            name: 'Credentials type'
        }, {
            type: 'str',
            is_required: true,
            key: 'project_id',
            name: 'Project ID'
        },{
            type: 'str',
            is_required: true,
            key: 'private_key_id',
            name: 'Private key Id'
        },{
            type: 'str',
            is_required: true,
            key: 'private_key',
            name: 'Private key'
        }, {
            type: 'str',
            is_required: true,
            key: 'client_email',
            name: 'Client e-mail'
        },{
            type: 'str',
            is_required: true,
            key: 'client_id',
            name: 'Client Id'
        },{
            type: 'str',
            is_required: true,
            key: 'auth_uri',
            name: 'Google auth URI'
        }, {
            type: 'str',
            is_required: true,
            key: 'token_uri',
            name: 'Google token URI'
        },{
            type: 'str',
            is_required: true,
            key: 'auth_provider_x509_cert_url',
            name: 'Auth provider cert URL'
        },{
            type: 'str',
            is_required: true,
            key: 'client_x509_cert_url',
            name: 'Client Cert URL'
        }, {
            type: 'str',
            is_required: false,
            key: 'region',
            name: 'Region name'
        }
        ]
    }
];


export {
    schemas
};