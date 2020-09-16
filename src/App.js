import React, { useState, useEffect } from "react";
import { Styles } from "./Styles";
import { Formik, useField, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import styled from "styled-components";
require("yup-phone"); //custom validation especially for Indian mobile numbers (found on stackoverflow :P)

const Container = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const Label = styled.label`
  flex: 0 0 150px;
`;

const Input = styled.input`
  flex: 1;
  width: 250px;
`;

const Select = styled.select`
  flex: 1;
  width: 250px;
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Error = styled.div`
  font-size: 14px;
  color: red;
`;

const UserInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <Container>
      <Label htmlFor={props.name}>{label}</Label>

      <SubContainer>
        <Input className="text-input" {...field} {...props} />
        {meta.touched && meta.error && <Error>{meta.error}</Error>}
      </SubContainer>
    </Container>
  );
};

const UserSelect = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <Container>
      <Label htmlFor={props.name}>{label}</Label>
      <SubContainer>
        <Select {...field} {...props} />
        {meta.touched && meta.error && <Error>{meta.error}</Error>}
      </SubContainer>
    </Container>
  );
};

function FormWrapper({ data, values, handleChange, ...props }) {
  let coursenames = [];
  for (let i = 0; i < data.length; i++) {
    coursenames.push(data[i].course_name);
  }
  const unixtime = [];
  for (let i = 0; i < data.length; i++) {
    if (values.courseName === data[i].course_name) {
      let len = data[i].slots.length;
      for (let j = 0; j < len; j++) {
        unixtime.push(data[i].slots[j].slot);
      }
    }
  }
  const currTime = Math.round(Date.now());
  //fixing the constraint as per question requiement
  const validTimeStamps = unixtime.filter(
    (t) => t - currTime >= 14400000 && t - currTime <= 604800000
  );
  let coursedates = [];
  for (let i = 0; i < validTimeStamps.length; i++) {
    coursedates.push(moment(validTimeStamps[i] * 1).format("DD/MM/YYYY"));
  }
  let newdates=[]; //remove duplicate dates from fetched valid timestamps
  for(let i=0;i<coursedates.length;i++){//dates are not visible in dropdown as they are violating the given contraint, they were working till 15/09/2020
    if(newdates.indexOf(coursedates[i])===-1){
      newdates.push(coursedates[i]);
    }
  }
  let coursetime = [];
  for (let i = 0; i < validTimeStamps.length; i++) {
    coursetime.push(moment(validTimeStamps[i] * 1).format("LT"));
  }

  return (
    <Form>
      <h1>Registration Form</h1>
      <UserInput
        label="Parent Name"
        name="parentName"
        type="text"
        placeholder="Enter the Name"
      />
      <UserInput
        label="Contact Number"
        name="parentContactNumber"
        type="number"
        placeholder="Enter the Mobile Number"
      />
      <UserInput
        label="Parent Email"
        name="parentEmail"
        type="email"
        placeholder="Enter the Email Id"
      />
      <UserInput
        label="Child Name"
        name="childName"
        type="text"
        placeholder="Enter the Name"
      />
      <UserInput
        label="Child Age"
        name="childAge"
        type="number"
        placeholder="Enter the Age"
      />
      <UserSelect
        label="Course Name"
        name="courseName"
        onChange={handleChange}
        value={values.courseName}
      >
        <option value="">Select course</option>
        {coursenames.map((course, key) => (
          <option key={key} value={course}>
            {course}
          </option>
        ))}
      </UserSelect>
      <UserSelect
        label="Trial Date"
        name="trialDate"
        onChange={handleChange}
        value={values.trialDate}
      >
        <option value="">Select Date</option>
        {newdates.map((date, key) => (
          <option key={key} value={date}>
            {date}
          </option>
        ))}
      </UserSelect>
      <UserSelect
        label="Trial Timings"
        name="trialTime"
        onChange={handleChange}
        value={values.trialTime}
      >
        <option value="">Select Timings</option>
        {coursetime.map((time, key) => (
          <option key={key} value={time}>
            {time}
          </option>
        ))}
      </UserSelect>
      <SubContainer style={{display:"flex", justifyContent:"space-around", alignContent:"center"}}>
        <button type="submit">
          {props.isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </SubContainer>
    </Form>
  );
}

function App() {
  const [data, setData] = useState({});
  async function fetchData() {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbzJ8Nn2ytbGO8QOkGU1kfU9q50RjDHje4Ysphyesyh-osS76wep/exec"
    );
    res.json().then((res) => setData(res));
  }
  useEffect(() => {
    fetchData();
  });

  return (
    <Styles>
      <Formik
        initialValues={{
          parentName: "",
          parentContactNumber: "",
          parentEmail: "",
          childName: "",
          childAge: "",
          courseName: "",
          trialDate: "",
          trialTime: "",
        }}
        validationSchema={Yup.object({
          parentName: Yup.string()
            .min(1, "Enter valid name")
            .required("Field cannot be left empty"),
          parentContactNumber: Yup.string()
            .phone()
            .required("Field cannot be left empty"),
          parentEmail: Yup.string()
            .email("Invalid email id")
            .required("Field cannot be left empty"),
          childName: Yup.string()
            .min(1, "Enter valid name")
            .required("Field cannot be left empty"),
          childAge: Yup.number()
            .min(5, "Can not be less than 5")
            .max(17, "Can not be greater than 17")
            .required("Field can not be left empty"),
          courseName: Yup.string(),
          trialDate: Yup.string(),
          trialTime: Yup.string(),
        })}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setTimeout(() => {
            alert(
              "Your input has been recorded \n" +
                JSON.stringify(values, null, 2)
            );
            resetForm();
            setSubmitting(false); //indicates form is now submitted
          }, 2000); //mimics api call similar to POST Request
        }}
      >
        {(props) => <FormWrapper {...props} data={data} />}
      </Formik>
    </Styles>
  );
}

export default App;
