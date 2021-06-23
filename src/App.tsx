import { Box, Button, Card, CardContent, CircularProgress, Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import { Field, Form, Formik, FormikConfig, FormikValues } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import { mixed, number, object } from 'yup';

const sleep = (time: any) => new Promise((acc) => setTimeout(acc, time));

export default function App() {
  return (
    <Card>
      <CardContent>
        <FormikStepper
          initialValues={{
            firstName: '',
            lastName: '',
            over18: false,
            money: 0,
            description: '',
          }}
          onSubmit={async (values) => {
            await sleep(3000);
            console.log('values', values);
          }}
        >
          <FormikStep label="Informações Pessoais">
            <Box paddingBottom={2}>
              <Field fullWidth name="firstName" component={TextField} label="Nome" />
            </Box>
            <Box paddingBottom={2}>
              <Field fullWidth name="lastName" component={TextField} label="Sobrenome" />
            </Box>
            <Box paddingBottom={2}>
              <Field
                name="over18"
                type="checkbox"
                component={CheckboxWithLabel}
                Label={{ label: 'Tenho mais que 18 anos' }}
              />
            </Box>
          </FormikStep>
          <FormikStep
            label="Informações do Depósito"
            validationSchema={object({
              money: mixed().when('over18', {
                is: false,
                then: number()
                  .required()
                  .max(
                    0,
                    'Você precisa ser maior de 18 anos para depositar qualquer quantia.'
                  ),
                otherwise: number().required(),
              }),
            })}
          >
            <Box paddingBottom={2}>
              <Field
                fullWidth
                name="money"
                type="number"
                component={TextField}
                label="Qual quantia deseja depositar?"
              />
            </Box>
          </FormikStep>
          <FormikStep label="Informações Adicionais">
            <Box paddingBottom={2}>
              <Field fullWidth name="description" component={TextField} label="Informações Adicionais" />
            </Box>
          </FormikStep>
        </FormikStepper>
      </CardContent>
    </Card>
  );
}

export interface FormikStepProps
  extends Pick<FormikConfig<FormikValues>, 'children' | 'validationSchema'> {
  label: string;
}

export function FormikStep({ children }: FormikStepProps) {
  return <>{children}</>;
}

export function FormikStepper({ children, ...props }: FormikConfig<FormikValues>) {
  const childrenArray = React.Children.toArray(children) as React.ReactElement<FormikStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];
  const [completed, setCompleted] = useState(false);

  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
          setCompleted(true);
        } else {
          setStep((s) => s + 1);

          // the next line was not covered in the youtube video
          //
          // If you have multiple fields on the same step
          // we will see they show the validation error all at the same time after the first step!
          //
          // If you want to keep that behaviour, then, comment the next line :)
          // If you want the second/third/fourth/etc steps with the same behaviour
          //    as the first step regarding validation errors, then the next line is for you! =)
          //
          // In the example of the video, it doesn't make any difference, because we only
          //    have one field with validation in the second step :)
          helpers.setTouched({});
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form autoComplete="off">
          <Stepper alternativeLabel activeStep={step}>
            {childrenArray.map((child, index) => (
              <Step key={child.props.label} completed={step > index || completed}>
                <StepLabel>{child.props.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {currentChild}

          <Grid container spacing={2}>
            {step > 0 ? (
              <Grid item>
                <Button
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Voltar
                </Button>
              </Grid>
            ) : null}
            <Grid item>
              <Button
                startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}
                disabled={isSubmitting}
                variant="contained"
                color="primary"
                type="submit"
              >
                {isSubmitting ? 'Enviando' : isLastStep() ? 'Enviar' : 'Próximo'}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}


