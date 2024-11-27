const fieldMapping = {
    mail: "Email",
    fname: "FirstName",
    lname: "LastName",
    phone: "PhoneNumber",
    country: "Country",
    churches: "Church",
    pass: "Password",
    churchName: "NameOfChurch",
    roles: "Title",
    zones: "Zone",
    departments: "Department",
    cellName: "NameOfCell",
    Position: "Designation",
};

function transformFormData(formData) {
    const transformedData = {};
    for (const oldField in fieldMapping) {
        const newField = fieldMapping[oldField];
        transformedData[newField] = formData[oldField];
    }
    return transformedData;
}

export default transformFormData;