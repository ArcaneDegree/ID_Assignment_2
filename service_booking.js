const FastDocAPI = LoadFastDocAPI();

const unrecognized_service_option_default_msg = "Unrecognized service";

let main_service_booking_container_div = document.getElementById("main_service_booking_container_div");

let service_selection_box = document.getElementById("service_selection_box");

let service_booking_form = document.getElementById("service_booking_form");

let service_booking_form_main_div = document.getElementById("service_booking_form_main_div");

let consultation_doctor_selection_box = document.getElementById("consultation_doctor_selection_box");

let payment_btn = document.getElementById("payment_btn");

let return_to_homepage_btn = document.getElementById("return_to_homepage_btn");

let clinic_appointment_location_selection_box = document.getElementById("clinic_appointment_location_selection_box");

let clinic_appointment_doctor_selection_box = document.getElementById("clinic_appointment_doctor_selection_box");

let service_booking_date_time_fields_title_label = document.getElementById("service_booking_date_time_fields_title_label");

let service_booking_date_time_fields_div = document.getElementById("service_booking_date_time_fields_div");

let initial_service_selection_key = sessionStorage.getItem("initial_service_selection_key");

async function ServiceSelectionBoxInitializationProc()
{
    let fastdoc_service_type_keys_arr = Object.keys(FastDocAPI.FastDocServiceType);

    // console.log(JSON.stringify(fastdoc_service_type_keys_arr));

    service_selection_box.innerHTML = "";

    for (let current_index = 0; current_index < fastdoc_service_type_keys_arr.length; current_index++)
    {
        let current_service_option = document.createElement("option");

        current_service_option.id = fastdoc_service_type_keys_arr[current_index] + "_option";

        switch (FastDocAPI.FastDocServiceType[current_service_option.id.replace("_option", "")])
        {
            case FastDocAPI.FastDocServiceType.BehavioralHealthService:
                current_service_option.innerText = "Behavioral health service";
            
                break;
            case FastDocAPI.FastDocServiceType.ClinicAppointment:
                current_service_option.innerText = "In-person clinic appointment";

                break;
            case FastDocAPI.FastDocServiceType.HealthScreening:
                current_service_option.innerText = "Health screening";

                break;
            case FastDocAPI.FastDocServiceType.MedicalCertificate:
                current_service_option.innerText = "Medical certificate";

                break;
            case FastDocAPI.FastDocServiceType.OnlineDoctorConsultation:
                current_service_option.innerText = "Online consultation with a doctor";

                break;
            case FastDocAPI.FastDocServiceType.Vaccination:
                current_service_option.innerText = "Vaccination";

                break;
            default:
                current_service_option.innerText = unrecognized_service_option_default_msg;
        }

        // console.log("Current service option inner text: " + current_service_option.innerText);

        if (current_service_option.innerText != unrecognized_service_option_default_msg)
        {
            // console.log("Appending option.");

            service_selection_box.appendChild(current_service_option);
        }

        if (current_service_option.id == initial_service_selection_key + "_option")
        {
            service_selection_box.selectedIndex = current_index;
        }
    }

    UpdateServiceBookingFieldsPanel();
}

async function UpdateServiceBookingFieldsPanel()
{
    let current_service_selection_key = service_selection_box.options[service_selection_box.selectedIndex].id.replace("_option", "");

    for (let currentIndex = 0; currentIndex < service_booking_form_main_div.children.length; currentIndex++)
    {
        if (service_booking_form_main_div.children[currentIndex].id == "service_booking_selection_fields_div" || service_booking_form_main_div.children[currentIndex].id == current_service_selection_key + "_fields_div")
        {
            service_booking_form_main_div.children[currentIndex].style.display = "flex";
        }
        else
        {
            service_booking_form_main_div.children[currentIndex].style.display = "none";
        }
    }

    service_booking_date_time_fields_title_label.style.display = "block";

    service_booking_date_time_fields_div.style.display = "flex";

    if (FastDocAPI.FastDocServiceType[current_service_selection_key] == FastDocAPI.FastDocServiceType.OnlineDoctorConsultation)
    {
        service_booking_date_time_fields_title_label.innerText = "Date and time of the online consultation:";
    }
    else if (FastDocAPI.FastDocServiceType[current_service_selection_key] == FastDocAPI.FastDocServiceType.ClinicAppointment)
    {
        service_booking_date_time_fields_title_label.innerText = "Date and time of the in-person clinic appointment:";
    }
    else if (FastDocAPI.FastDocServiceType[current_service_selection_key] == FastDocAPI.FastDocServiceType.HealthScreening)
    {
        service_booking_date_time_fields_title_label.innerText = "Date and time of the health screening:";
    }
    else if (FastDocAPI.FastDocServiceType[current_service_selection_key] == FastDocAPI.FastDocServiceType.Vaccination)
    {
        service_booking_date_time_fields_title_label.innerText = "Date and time of the vaccination:";
    }
    else if (FastDocAPI.FastDocServiceType[current_service_selection_key] == FastDocAPI.FastDocServiceType.BehavioralHealthService)
    {
        service_booking_date_time_fields_title_label.innerText = "Date and time of the behavioral health check-up:";
    }
    else
    {
        service_booking_date_time_fields_title_label.style.display = "none";

        service_booking_date_time_fields_div.style.display = "none";
    }

    payment_btn.style.display = "block";

    return_to_homepage_btn.style.display = "block";
}

async function ConsultationDoctorSelectionBoxInitializationProc()
{
    FastDocAPI.GetAllDoctorNames((request_obj) =>
    {
        if (request_obj.status != 200)
        {
            console.log("Access denied.");

            return;
        }

        let doctor_obj_arr = JSON.parse(request_obj.responseText);

        for (let current_index = 0; current_index < doctor_obj_arr.length; current_index++)
        {
            let new_doctor_name_option = document.createElement("option");

            new_doctor_name_option.innerText = doctor_obj_arr[current_index].Name;

            consultation_doctor_selection_box.appendChild(new_doctor_name_option);
        }
    });
}

async function ClinicAppointmentLocationSelectionBoxInitProc()
{
    FastDocAPI.GetClinicDistrictLocationNames((request_obj) =>
    {
        if (request_obj.status != 200)
        {
            console.log("Access denied.");

            return;
        }

        let clinic_obj_arr = JSON.parse(request_obj.responseText);

        for (let current_index = 0; current_index < clinic_obj_arr.length; current_index++)
        {
            let clinic_location_option_box = document.createElement("option");

            clinic_location_option_box.innerText = clinic_obj_arr[current_index].DistrictName;

            clinic_appointment_location_selection_box.appendChild(clinic_location_option_box);
        }
    });
}

async function ClinicAppointmentDoctorSelectionBoxInitProc()
{
    FastDocAPI.GetAllDoctorNames((request_obj) =>
    {
        if (request_obj.status != 200)
        {
            console.log("Access denied.");

            return;
        }

        let doctor_obj_arr = JSON.parse(request_obj.responseText);

        for (let current_index = 0; current_index < doctor_obj_arr.length; current_index++)
        {
            let doctor_name_option_box = document.createElement("option");

            doctor_name_option_box.innerText = doctor_obj_arr[current_index].Name;

            clinic_appointment_doctor_selection_box.appendChild(doctor_name_option_box);
        }
    });
}

service_selection_box.addEventListener("change", (event_obj) =>
{
    UpdateServiceBookingFieldsPanel();
});

return_to_homepage_btn.addEventListener("click", (mouse_event_obj) =>
{
    window.location.href = "/index.html";
});

service_booking_form.addEventListener("submit", (submit_event_obj) =>
{
    
});

sessionStorage.setItem("initial_service_selection_key", null);

// Initialization procedures for online consultation input fields.
ServiceSelectionBoxInitializationProc();

ConsultationDoctorSelectionBoxInitializationProc();

// Initialization procedures for in-person clinic appointment input fields.
ClinicAppointmentLocationSelectionBoxInitProc();

ClinicAppointmentDoctorSelectionBoxInitProc();

// Current displayed service booking subform update procedure.
UpdateServiceBookingFieldsPanel();

main_service_booking_container_div.style.display = "flex";
