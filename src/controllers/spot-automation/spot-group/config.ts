export const SUPPORTED_RESOURCE_TYPES = {
    'inventory.CloudService?provider=aws&cloud_service_group=EC2&cloud_service_type=AutoScalingGroup': {
        'name': '[AWS] Auto Scaling Group',
        'recommended_title': 'Auto Scaling Group',
        icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-EC2-Auto-Scaling.svg'
    },
    'inventory.CloudService?provider=aws&cloud_service_group=EKS&cloud_service_type=Cluster': {
        'name': '[AWS] EKS Node Group',
        'recommended_title': 'EKS Node Group',
        icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/Amazon-Elastic-Kubernetes-Service.svg'
    }
};
