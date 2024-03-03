import React, { Component } from "react";
import "./HomePage.scss";
import ReactFileReader from "react-file-reader";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import IconButton from "@material-ui/core/IconButton";
import Pagination from "@material-ui/lab/Pagination";
import DeleteIcon from "@material-ui/icons/Delete";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


import CrudOperation from "../services/CrudOperation";
import { Statistics } from "../configuration/Configuration";

const crudservice = new CrudOperation();



export default class HomePage extends Component {

    constructor() {
        super();
        this.state = {
            totalPages: 0,
            PageNumber: 1,
            RecordPerPage: 6,
            CurrentPage: 1,
            RecordData: [],
            totalRecords: 0,
            fileUploaded: false,  // Placeholder
            File: new FormData(),
            FileExtension: "",
            modalType: "",
            selectedAvgAgeTeam: "Racing",
            AvgTeamData: 0,

            selectedCommonNameTeam: "River",
            CommonNameData: [],

            selectedState: "Casado",
            selectedEducation: "Universitario",
            StateEducationData: [],

            ShowListBox: 0,

            StatisticsData: [],

        }

    }

    componentWillMount() {
        console.log("Component Unmounted Calling");
        this.ReadRecord(this.state.CurrentPage)
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.selectedAvgAgeTeam !== this.state.selectedAvgAgeTeam ||
            prevState.selectedState !== this.state.selectedState ||
            prevState.selectedEducation !== this.state.selectedEducation ||
            prevState.selectedCommonNameTeam !== this.state.selectedCommonNameTeam
        ) {
            this.setState({
                AvgTeamData: 0,
                CommonNameData: [],
                StateEducationData: [],
                StatisticsData: [],
                ShowListBox: 0
            });
        }
    }
    

    ReadRecord = (CurrentPage) => {
        let data = {
            recordPerPage: this.state.RecordPerPage,
            pageNumber: CurrentPage,
        }

        crudservice.ReadRecord(data)
            .then((data) => {
                console.log("Data : ", data.data);
                this.setState({ RecordData: data.data.readRecord });
                this.setState({ totalPages: data.data.totalPages });
                this.setState({ totalRecords: data.data.totalRecords });
            }).catch((error) => {
                console.log("Error : ", error);
            })
        this.setState({ ShowListBox: 1});

    }

    //Placeholder
    changeHandler = (event) => {
        this.setState({ fileUploaded: true });
    }


    handlePaging = (event, value) => {
        this.setState({ PageNumber: value });
        console.log("Value : ", value);
        this.ReadRecord(value);
    }


    handleDelete = (userId) => {
        const userIdToDelete = userId.userId;
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este registro?");
        if (confirmDelete) {
            crudservice.DeleteRecord(userIdToDelete)
                .then((data) => {
                    console.log("Data: ", data);
                    this.ReadRecord(this.state.CurrentPage);
                }).catch((error) => {
                    console.log("Error: ", error);
                    this.ReadRecord(this.state.CurrentPage);
                });
        } else {
            console.log("Eliminación cancelada");
        }
    }
    

    handleFiles = (files) => {
        this.setState({ File: files[0] });
        this.setState({ FileExtension: files[0].name.split('.').pop() });
        this.setState({ fileUploaded: true });
        this.setState({ ShowListBox: 1});
    };

    handleClick = (event) => {
        event.preventDefault();
        if (this.state.FileExtension !== '') {
            const data = new FormData();
            data.append("File", this.state.File)
            if (this.state.FileExtension === "xlsx" || this.state.FileExtension === "xls") {
                crudservice.UploadExcelFile(data)
                    .then((response) => {
                        this.handleUploadResponse(response);
                    }).catch((error) => {
                        console.log("Error : ", error);
                        this.ReadRecord(this.state.PageNumber);
                    })
            } else if (this.state.FileExtension === "csv") {
                crudservice.UploadCsvFile(data)
                    .then((response) => {
                        this.handleUploadResponse(response);
                    }).catch((error) => {
                        console.log("Error : ", error);
                        this.ReadRecord(this.state.PageNumber);
                    })
            }
        } else {
            alert("Please select a file to upload");
        }
    };

    handleUploadResponse = (response) => {
        console.log("Upload response:", response);

        if (response.data && response.data.isSuccess === false && response.data.message) {
            alert(response.data.message);
        } else if (response.data && response.data.isSuccess === true) {
            console.log("Data : ", response.data);
            this.ReadRecord(this.state.PageNumber);
        } else {
            alert("Error in uploading file. Refresh and try again.");
        }
    }

    handleInfo = () => {
        const { selectedAvgAgeTeam, selectedCommonNameTeam, selectedState, selectedEducation } = this.state;

        crudservice.ReadAvgAge({ team: selectedAvgAgeTeam })
            .then(response => {
                console.log("Response ReadAveAge:", response);
                if (response.data && response.data.isSuccess) {
                    this.setState({ AvgTeamData: response.data.avgAge });
                    console.log("AvgTeamData:", this.state.AvgTeamData);
                } else {
                    console.log("Error fetching average age data:", response.message);
                }
            })
            .catch(error => {
                console.log("Error fetching average age data:", error);
            });

        crudservice.SearchCommonNames({ team: selectedCommonNameTeam })
            .then(response => {
                console.log("Response SearchCommonNames:", response);
                if (response.data && response.data.isSuccess) {
                    this.setState({ CommonNameData: response.data.mostCommonNames });
                    console.log("CommonNameData:", this.state.CommonNameData);
                } else {
                    console.log("Error fetching common names data:", response.message);
                }
            })
            .catch(error => {
                console.log("Error fetching common names data:", error);
            });

        crudservice.SearchByStateAndEducation({ state: selectedState, education: selectedEducation })
            .then(response => {
                console.log("Response SearchByStateAndEducation:", response);
                if (response.data && response.data.isSuccess) {
                    this.setState({ StateEducationData: response.data.results });
                    console.log("StateEducationData:", this.state.StateEducationData);
                } else {
                    console.log("Error fetching state and education data:", response.message);
                }
            })
            .catch(error => {
                console.log("Error fetching state and education data:", error);
            });

        crudservice.Statistics()
            .then(response => {
                console.log("Response Statistics:", response);
                if (response.data && response.data.isSuccess) {
                    this.setState({ StatisticsData: response.data.teamStatisticsList });
                    console.log("StatisticsData:", this.state.teamStatisticsList);
                } else {
                    console.log("Error fetching statistics data:", response.message);
                }
            })
            .catch(error => {
                console.log("Error fetching statistics data:", error);
            });

            this.setState({ ShowListBox: 2 });

    }



    render() {
        let state = this.state;
        let Self = this;
        return (
            <div className="MainContainer">
                <div className="SubContainer">

                    <div className="Box1">
                        <div className="Input-Container">
                            <div className="flex-Container">
                                <div className="Header">Challenge App</div>
                                <div className="sub-flex-Container">
                                    <div className="FileName">{state.fileUploaded ? state.File.name : "Agrega mas archivos"}</div>
                                    <div className="UploadButton">
                                        <ReactFileReader
                                            handleFiles={this.handleFiles}
                                            fileTypes={[".csv", ".xlsx", ".xls"]}
                                            className="Upload"
                                        >
                                            <IconButton
                                                variant="contained"
                                                color="primary"
                                                component="span"
                                                onClick={this.handleClick}
                                            >
                                                <Icon color="deepPurple">add_circle</Icon>
                                            </IconButton>
                                        </ReactFileReader>
                                    </div>
                                </div>
                                <div className="flex-button">
                                    <Button variant="contained" color="primary" onClick={this.handleClick}>
                                        Upload
                                    </Button>
                                </div>
                            </div>

                            {/* ReadAvgAge */}
                            <div className="Label">Edad Promedio por Equipo</div>
                            <div className="flex-Container">
                                <select className="Select-Container" defaultValue="Racing" onChange={(e) => this.setState({ selectedAvgAgeTeam: e.target.value })}>
                                    <option value="River">River</option>
                                    <option value="Velez">Velez</option>
                                    <option value="Estudiantes">Estudiantes</option>
                                    <option value="Independiente">Independiente</option>
                                    <option value="Huracán">Huracán</option>
                                    <option value="San Lorenzo">San Lorenzo</option>
                                    <option value="Gimnasia LP">Gimnasia LP</option>
                                    <option value="Newells">Newells</option>
                                    <option value="Boca">Boca</option>
                                    <option value="Rosario Central">Rosario Central</option>
                                    <option value="Racing">Racing</option>
                                </select>

                            </div>
                            {/* SearchByStateAndEducation */}

                            <div className="Label">Listado por Estado y Estudios (100) </div>
                            <div className="flex-Container">
                                <select className="Select-Container" defaultValue="Casado" onChange={(e) => this.setState({ selectedState: e.target.value })}>
                                    <option value="Casado">Casado</option>
                                    <option value="Soltero">Soltero</option>
                                </select>
                                <select className="Select-Container" defaultValue="Casado" onChange={(e) => this.setState({ selectedEducation: e.target.value })}>
                                    <option value="Universitario">Universitario</option>
                                    <option value="Terciario">Terciario</option>
                                    <option value="Secundario">Secundario</option>
                                </select>

                            </div>
                            {/* SearchCommonNames */}
                            <div className="Label"> Nombres Comunes (5) </div>
                            <div className="flex-Container">
                                <select className="Select-Container" defaultValue="River" onChange={(e) => this.setState({ selectedCommonNameTeam: e.target.value })}>
                                    <option value="River">River</option>
                                    <option value="Velez">Velez</option>
                                    <option value="Estudiantes">Estudiantes</option>
                                    <option value="Independiente">Independiente</option>
                                    <option value="Huracán">Huracán</option>
                                    <option value="San Lorenzo">San Lorenzo</option>
                                    <option value="Gimnasia LP">Gimnasia LP</option>
                                    <option value="Newells">Newells</option>
                                    <option value="Boca">Boca</option>
                                    <option value="Rosario Central">Rosario Central</option>
                                    <option value="Racing">Racing</option>
                                </select>

                            </div>
                            
                            <div className="flex-Container">
                                <Button variant="contained" size="small" color="secondary" onClick={this.handleInfo}>
                                    Buscar
                                </Button>
                            </div>
                            <Button className="Info-Button"
                                variant="outlined"
                                size="small"
                                color="secondary"
                                component="span"
                                onClick={() => {
                                    this.setState(prevState => ({
                                        ShowListBox: prevState.ShowListBox === 1 ? 2 : 1
                                    }));

                                }}
                            >
                                {this.state.ShowListBox === 1 ? "Ver Informacion" : "Ver Listado"}
                            </Button>
                        </div>

                    </div>


                    {Array.isArray(state.RecordData) && state.RecordData.length > 0 && state.ShowListBox === 1 && (
                        <div className="Box2">

                            <div className="data-flex" style={{ color: "grey" }}>
                                <div className="UserId">UserId</div>
                                <div className="UserName">Nombre</div>
                                <div className="Age">Edad</div>
                                <div className="Team">Equipo</div>
                                <div className="State">Estado Civil</div>
                                <div className="Education">Nivel de Estudios</div>
                                <div className="Delete">Delete</div>
                            </div>
                            {Array.isArray(state.RecordData) && state.RecordData.length > 0 ?
                                state.RecordData.map(function (data, index) {
                                    return (
                                        <div className="data-flex" key={index}>
                                            <div className="UserId">{data.userId}</div>
                                            <div className="UserName">{data.userName}</div>
                                            <div className="Age">{data.age}</div>
                                            <div className="Team">{data.team}</div>
                                            <div className="State">{data.state}</div>
                                            <div className="Education">{data.education}</div>
                                            <div className="Delete">
                                                <Button variant="outlined" onClick={() => { Self.handleDelete(data) }}>
                                                    <DeleteIcon />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                }) : null
                            }
                            <div className="Header"> Cantidad de Registros: {state.totalRecords} </div>

                            <Pagination
                                count={state.totalPages}
                                page={state.PageNumber}
                                onChange={this.handlePaging}
                                variant="outlined"
                                shape="rounded" />
                        </div>


                    )}

                    {Array.isArray(state.RecordData) && state.RecordData.length > 0 && state.ShowListBox === 2 && (



                        <div className="Box3">
                            <Accordion>
                                <AccordionSummary>
                                    <Typography variant="h6">Promedio de Edad en {this.state.selectedAvgAgeTeam}: {this.state.AvgTeamData}</Typography>
                                </AccordionSummary>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Typography variant="h6">Listado de Personas según Estado y Educación ({this.state.selectedState}, {this.state.selectedEducation})</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        {/* <div className="Box3"> */}
                                        <div className="data-flex" style={{ color: "grey" }}>

                                            <div className="UserName">Nombre</div>
                                            <div className="Age">Edad</div>
                                            <div className="Team">Equipo</div>

                                        </div>
                                        {Array.isArray(state.StateEducationData) && state.RecordData.length > 0 ?
                                            state.StateEducationData.map(function (data, index) {
                                                return (
                                                    <div className="data-flex" key={index}>
                                                        <div className="UserId">{data.userId}</div>
                                                        <div className="UserName">{data.userName}</div>
                                                        <div className="Age">{data.age}</div>
                                                        <div className="Team">{data.team}</div>
                                                    </div>
                                                );
                                            }) : null
                                        }

                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">Nombres más comunes en {this.state.selectedCommonNameTeam}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div>
                                        {Array.isArray(state.CommonNameData) && state.CommonNameData.length > 0 ?
                                            state.CommonNameData.map((data, index) => (
                                                <div key={index}>
                                                    <div className="UserName">{`${index + 1}. ${data.userName}`}</div>
                                                </div>
                                            )) : <Typography>No hay datos disponibles</Typography>
                                        }
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                            <div style={{ width: '100%' }}>
                                <Accordion>
                                    <AccordionSummary>
                                        <Typography variant="h6">Estadísticas de los Equipos</Typography>
                                    </AccordionSummary>
                                </Accordion>
                                {state.StatisticsData.map((team, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls={`panel${index + 1}-content`}
                                            id={`panel${index + 1}-header`}
                                        >
                                            <Typography>{`${index + 1}. Estadísticas de ${team.teamName}`}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div>
                                                <Typography>Promedio de Edad: {team.averageAge.toFixed(2)}</Typography>
                                                <Typography>Edad Mínima Registrada: {team.minAge}</Typography>
                                                <Typography>Edad Máxima Registrada: {team.maxAge}</Typography>
                                                <Typography>Cantidad de Socios: {team.numberOfMembers}</Typography>
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </div>
                        </div>




                    )}
                </div>

            </div>


        );
    }
}