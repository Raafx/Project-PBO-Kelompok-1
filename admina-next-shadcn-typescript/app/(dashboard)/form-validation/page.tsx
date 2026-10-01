"use client";

import ValidateForm from "@/app/(dashboard)/form-validation/validate-form";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";

const FormValidation = () => {
    return (
        <>
            <DashboardBreadcrumb title="Form Validation" text="Form Validation" />

            <Suspense fallback={<LoadingSkeleton />}>
                <ValidateForm />
            </Suspense>

        </>
    );
};

export default FormValidation;
