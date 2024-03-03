import Axios from "./AxiosServices.js"
import Configuracion from "../configuration/Configuration.js"

const axios = new Axios();

export default class CrudOperation {
    UploadExcelFile(data) {
        return axios.post(Configuracion.InsertExcelRecord, data, false);
    }

    UploadCsvFile(data) {
        return axios.post(Configuracion.InsertCsvRecord, data, false);
    }

    ReadRecord(data) {
        return axios.post(Configuracion.GetRecord, data, false);
    }

    DeleteRecord(data) {
        return axios.delete(
            Configuracion.DeleteRecord,
            {
                data: {
                    userId: data
                },
            }, false);
    }

    ReadAvgAge(data) {
        return axios.post(Configuracion.ReadAvgAge, data, false);
    }

    Statistics() {
        return axios.get(Configuracion.Statistics, false);
    }

    SearchByStateAndEducation(data) {
        return axios.post(Configuracion.SearchByStateAndEducation, data, false);
    }

    SearchCommonNames(data) {
        return axios.post(Configuracion.SearchCommonNames, data, false);
    }
}


