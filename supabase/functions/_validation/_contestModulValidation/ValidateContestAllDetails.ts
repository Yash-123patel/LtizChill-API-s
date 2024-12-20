import { handleAllErrors } from "../../_errorHandler/ErrorsHandler.ts";
import { ContestModel } from "../../_model/ContestModel.ts";
import { HTTP_STATUS_CODE } from "../../_shared/_constant/HttpStatusCodes.ts";
import { ArrayContstant } from "../../_shared/_constant/ArrayConstants.ts";
import { CONTEST_VALIDATION_MESSAGES } from "../../_shared/_commonValidationMessages/ValidationMessages.ts";
import { COMMON_ERROR_MESSAGES } from "../../_shared/_commonErrorMessages/ErrorMessages.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";


export function validateContestId(contest_id:string){
    if (!contest_id || !V4.isValid(contest_id)) {
        console.log("Error: Invalid or missing contest ID.");
        return handleAllErrors({
           status_code: HTTP_STATUS_CODE.BAD_REQUEST,
           error_message: CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_ID,
         
        });
     }
     return {};
    }

export function validateContestDetails(contestDetails: Partial<ContestModel>, isUpdate: boolean = false) {
    const validationErrors: string[] = [];
  

    //checking for empty body if body empty, directlly returning error responses
    if (Object.keys(contestDetails).length === 0) {
        console.log("Error: Empty request body.");
        return handleAllErrors({
            status_code: HTTP_STATUS_CODE.BAD_REQUEST,
            error_message: COMMON_ERROR_MESSAGES.EMPTY_REQUEST_BODY,
          
        });
    }

    
    // Validating contest title if invalid title pushing the error message in error array
    console.log(contestDetails.contest_title); 
    if (contestDetails.contest_title) {
       
        console.log("Validating contest title...");

        if (contestDetails.contest_title.trim().length < 3 || contestDetails.contest_title.trim().length > 100) {
            
            console.log("Invalid contest title length: Title must be between 3 and 100 characters.");
            validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_TITLE);
        }
    } else if (!isUpdate) {
        console.log("Contest title is missing.");
        validationErrors.push(CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_TITLE);
    }

    // Validating contest description
    if (contestDetails.description) {
        console.log("Validating contest description...");

        if (contestDetails.description.trim().length < 8 || contestDetails.description.trim().length > 500) {
           
            console.log("Invalid contest description length: Description must be between 8 and 500 characters.");
            validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_DESCRIPTION);
        }
    }

    // Validating contest start_date
    if (contestDetails.start_date) {
        console.log("Validating contest start date...");

        if (!isValidISODate(contestDetails.start_date)) {
           
            console.log("Invalid start date format.");
            validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_START_DATE_FORMAT);
        } 
    } else if (!isUpdate) {
        console.log("Contest start date is missing.");
        validationErrors.push(CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_START_DATE);
    }

    // Validating contest end_date
    if (contestDetails.end_date) {
        console.log("Validating contest end date...");

        if (!isValidISODate(contestDetails.end_date)) {
           
            console.log("Invalid end date format.");
            validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_END_DATE_FORMAT);
        } else {
           
            const end_date = new Date(contestDetails.end_date);
           
            if (contestDetails.start_date && isValidISODate(contestDetails.start_date)) {
              
                const start_date = new Date(contestDetails.start_date);
                if (start_date >= end_date) {
                    console.log("End date must be after the start date.");
                    validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_END_DATE);
                }
            }
        }
    } else if (!isUpdate) {
        console.log("Contest end date is missing.");
        validationErrors.push(CONTEST_VALIDATION_MESSAGES.MISSING_CONTEST_END_DATE);
    }

    // Validating contest status
    if (contestDetails.status) {
       
        console.log("Validating contest status...");
       
        const validStatuses = ArrayContstant.CONTEST_STATUS;
       
        if (!validStatuses.includes(contestDetails.status)) {
            console.log("Invalid contest status: Valid statuses are", validStatuses.join(", "));
            validationErrors.push(CONTEST_VALIDATION_MESSAGES.INVALID_CONTEST_STATUS);
        }
    } else if (!isUpdate) {
       
        console.log("Contest status is missing. Setting to default status.");
        contestDetails.status = ArrayContstant.CONTEST_STATUS[0].toLocaleLowerCase();
    }

    console.log(validationErrors);

    // Returning validation errors if any
    if (validationErrors.length > 0) {
        console.log("Validation failed with the following errors:", validationErrors);
        return handleAllErrors({
            status_code: HTTP_STATUS_CODE.BAD_REQUEST,
            error_message: validationErrors.join(", "), // Combine all error messages
           
        });
    }

    return {};
}

export function isValidISODate(date: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
    return isoDateRegex.test(date);
}
