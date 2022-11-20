const DEV_URL = 'https://sd4j0jlbq9.execute-api.ap-southeast-1.amazonaws.com/dev/api/v1/hrms/';
const QA_URL = 'https://ffp23suwh7.execute-api.us-east-2.amazonaws.com/uat/api/v1/hrms/';
// const PROD_URL = 'https://t21urj33n9.execute-api.ap-south-1.amazonaws.com/prod/api/v1/';
// const UAT_URL = 'https://ut8olba8ia.execute-api.us-east-2.amazonaws.com/uat/api/v1/';

const DEV = 'DEV';
const QA = 'QA';
const PROD = 'PROD';
const UAT = 'UAT';

const activeProfile = PROD;

function getServerUrl() {
    if (activeProfile == DEV) {
        return DEV_URL;
    } else if (activeProfile == QA) {
        return QA_URL;
    } else if (activeProfile == PROD) {
        return PROD_URL;
    } else if (activeProfile == UAT) {
        return UAT_URL;
    }
    return '';
}