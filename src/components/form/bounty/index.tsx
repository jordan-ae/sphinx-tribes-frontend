/* eslint-disable react/prop-types */
import { EuiText } from '@elastic/eui';
import { Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFeatureFlag, useIsMobile } from 'hooks';
import { RefineDescriptionModal } from 'components/common/RefineDescriptionModal';
import { snippetStore } from 'store/snippetStore';
import { toCapitalize } from '../../../helpers/helpers';
import api from '../../../api';
import { colors } from '../../../config/colors';
import { BountyDetailsCreationData } from '../../../people/utils/BountyCreationConstant';
import { formDropdownOptions } from '../../../people/utils/Constants';
import { useStores } from '../../../store';
import { Button, Divider } from '../../common';
import ImageButton from '../../common/ImageButton';
import Input from '../inputs';
import { dynamicSchemaAutofillFieldsByType, dynamicSchemasByType } from '../schema';
import {
  BWrap,
  BottomContainer,
  BountyContainer,
  ChooseBountyContainer,
  CreateBountyHeaderContainer,
  SchemaOuterContainer,
  SchemaTagsContainer,
  Wrap,
  EditBountyText
} from '../style';
import { FormField, swapElements, validator } from '../utils';
import { FormProps } from '../interfaces';

function Form(props: FormProps) {
  const {
    buttonsOnBottom,
    wrapStyle,
    smallForm,
    readOnly,
    scrollDiv: scrollRef,
    initialValues
  } = props;
  const page = 1;
  const isMobile = useIsMobile();
  const { isEnabled } = useFeatureFlag('staking');
  const [loading, setLoading] = useState(true);
  const [dynamicInitialValues, setDynamicInitialValues]: any = useState(null);
  const [dynamicSchema, setDynamicSchema]: any = useState(null);
  const [dynamicSchemaName, setDynamicSchemaName] = useState('');
  const [disableFormButtons, setDisableFormButtons] = useState(false);
  const [peopleList, setPeopleList] = useState<any>();
  const [assigneeName, setAssigneeName] = useState<string>('');
  const refBody: any = useRef(null);
  const { main, ui } = useStores();
  const color = colors['light'];
  const [isFocused, setIsFocused] = useState({});
  const [workspaceid, setWorskspaceid] = useState('');
  const [featureid, setFeatureid] = useState('');
  const [workspaceFeature, setWorkspaceFeatures] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [featurePhase, setFeaturedPhase] = useState<Array<{ value: string; label: string }>>([]);

  const [schemaData, setSchemaData] = useState(BountyDetailsCreationData.step_1);
  const [stepTracker, setStepTracker] = useState<number>(1);
  const [userWorkspaces, setUserWorkspaces] = useState<Array<{ label: string; value: string }>>([]);

  let lastPage = 1;
  const scrollDiv = scrollRef ?? refBody;

  const initValues = dynamicInitialValues || initialValues;

  const NextStepHandler = useCallback(() => {
    setStepTracker(stepTracker < 5 ? stepTracker + 1 : stepTracker);
  }, [stepTracker]);

  const PreviousStepHandler = useCallback(() => {
    setStepTracker(stepTracker > 1 ? stepTracker - 1 : stepTracker);
  }, [stepTracker]);

  useEffect(() => {
    switch (stepTracker) {
      case 1:
        setSchemaData(BountyDetailsCreationData.step_1);
        break;
      case 2:
        setSchemaData(BountyDetailsCreationData.step_2);
        break;
      case 3:
        setSchemaData(BountyDetailsCreationData.step_3);
        break;
      case 4:
        setSchemaData(BountyDetailsCreationData.step_4);
        break;
      case 5:
        setSchemaData(BountyDetailsCreationData.step_5);
        break;
      default:
        return;
    }
  }, [stepTracker]);

  const getUUIDFromURL = useCallback((url: string) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  }, []);

  useEffect(() => {
    async function fetchWorkspaces() {
      if (ui.meInfo?.id) {
        await main.getUserDropdownWorkspaces(ui.meInfo?.id);
      }
    }
    fetchWorkspaces();
  }, [main, ui.meInfo?.id]);

  useEffect(() => {
    snippetStore.loadSnippets(workspaceid);
  }, [workspaceid]);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`people?page=1&search=&sortBy=last_login&limit=100`);
        setPeopleList(response);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    const dSchema = props.schema?.find((f: any) => f.defaultSchema);
    const type = initialValues?.type;
    if (dSchema && type) {
      const editSchema = dynamicSchemasByType[type];
      setDynamicSchema(editSchema);
      setDynamicSchemaName(type);
    } else if (dSchema) {
      setDynamicSchema(dSchema.defaultSchema);
      setDynamicSchemaName(dSchema.defaultSchemaName);
    }
    setLoading(false);
  }, [initialValues?.type, props.schema]);

  // this useEffect triggers when the dynamic schema name is updated
  // checks if there are autofill fields that we can pull from local storage

  function reloadForm() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 20);
  }
  useEffect(() => {
    const formRef = props.formRef?.current;
    const vals = formRef && formRef.values;
    if (vals) {
      if (dynamicSchemaAutofillFieldsByType[dynamicSchemaName]) {
        Object.keys(dynamicSchemaAutofillFieldsByType[dynamicSchemaName]).forEach((k: any) => {
          const localStorageKey = dynamicSchemaAutofillFieldsByType[dynamicSchemaName][k];
          const valueToAssign = ui[localStorageKey];
          // if no value exists already
          if (!vals[k] || vals[k] === undefined) {
            if (valueToAssign) {
              setDynamicInitialValues({ ...initValues, [k]: valueToAssign });
              // re-render
              reloadForm();
            }
          }
        });
      }
    }
  }, [dynamicSchemaName, initValues, props.formRef, ui]);

  const scrollToTop = useCallback(() => {
    if (scrollDiv && scrollDiv.current) {
      scrollDiv.current.scrollTop = 0;
    }
  }, [scrollDiv]);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  if (props.paged) {
    props.schema?.forEach((s: any) => {
      if (s.page > lastPage) lastPage = s.page;
    });
  }

  let schema = props.paged ? props.schema?.filter((f: any) => f.page === page) : props.schema;

  useEffect(() => {
    (async () => {
      try {
        interface Feature {
          uuid: string;
          name: string;
        }
        let allFeatures: Feature[] = [];
        let currentPage = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const features = await main.getWorkspaceFeatures(workspaceid, {
            page: currentPage,
            status: 'active'
          });

          if (Array.isArray(features)) {
            allFeatures = [...allFeatures, ...features];
            console.log(allFeatures);
            hasMoreData = features.length > 0; // If no features returned, stop fetching
            console.log(hasMoreData);
            currentPage++;
          } else {
            console.log('Unexpected features object:', features);
            hasMoreData = false; // Stop loop on unexpected response
          }
        }

        // Process features once all pages are fetched
        const filteredFeatures = allFeatures.map(
          ({ uuid, name }: { uuid: string; name: string }) => ({
            value: uuid,
            label: name
          })
        );

        setWorkspaceFeatures(filteredFeatures);
      } catch (error) {
        console.error('Error fetching or parsing features:', error);
      }
    })();
  }, [main, workspaceid]);

  const snippets = snippetStore.getAllSnippets();

  const filteredSnippets = snippets.map((p: any) => ({
    value: p.id,
    label: p.title,
    snippet: p.snippet
  }));

  useEffect(() => {
    (async () => {
      try {
        const phase = await main.getFeaturePhases(featureid);

        if (Array.isArray(phase)) {
          const filteredPhase = phase.map(({ uuid, name }: { uuid: string; name: string }) => ({
            value: uuid,
            label: name
          }));
          setFeaturedPhase(filteredPhase);
        } else {
          console.log('Features object:', phase);
        }
      } catch (error) {
        console.error('Error fetching or parsing features:', error);
      }
    })();
  }, [featureid, main]);

  useEffect(() => {
    if (main.dropDownWorkspaces.length) {
      const workspaceOptions = main.dropDownWorkspaces.map((org: any) => ({
        label: toCapitalize(org.name),
        value: org.uuid
      }));
      setUserWorkspaces(workspaceOptions);

      if (schema && Array.isArray(schema)) {
        const orgUuidFieldIndex = schema.findIndex((field: FormField) => field.name === 'org_uuid');
        if (orgUuidFieldIndex !== -1) {
          schema[orgUuidFieldIndex].options = workspaceOptions;
        }
      }
    }
  }, [main.dropDownWorkspaces, schema]);

  useEffect(() => {
    if (userWorkspaces.length && !dynamicInitialValues?.org_uuid) {
      const uuid = getUUIDFromURL(window.location.href);
      const defaultWorkspace = userWorkspaces.find((obj: any) => obj.value === uuid);

      if (defaultWorkspace) {
        setDynamicInitialValues((prev: any) => ({
          ...prev,
          org_uuid: defaultWorkspace.value
        }));
        reloadForm();
      }
    }
  }, [userWorkspaces, dynamicInitialValues?.org_uuid, getUUIDFromURL]);

  // replace schema with dynamic schema if there is one
  schema = dynamicSchema || schema;
  if (schema && Array.isArray(schema)) {
    const featureFieldIndex = schema.findIndex((field: FormField) => field.name === 'feature_uuid');
    if (featureFieldIndex !== -1) {
      schema[featureFieldIndex].options = workspaceFeature;
    }
    const phaseFieldIndex = schema.findIndex((field: FormField) => field.name === 'phase_uuid');
    if (phaseFieldIndex !== -1) {
      schema[phaseFieldIndex].options = featurePhase;
    }
  }

  schema = isMobile ? swapElements([...schema], 7, 8) : schema;

  // if no schema, return empty div
  if (loading || !schema) return <div />;

  const buttonAlignment = buttonsOnBottom
    ? { zIndex: 20, bottom: 0, height: 108, justifyContent: 'center' }
    : { top: 0 };
  const formPad = buttonsOnBottom ? { paddingTop: 30 } : {};

  const buttonStyle = buttonsOnBottom ? { width: '80%', height: 48 } : {};

  const dynamicFormOptions =
    (props.schema && props.schema[0] && formDropdownOptions[props.schema[0].dropdownOptions]) || [];

  // inject owner tribes
  const tribesSelectorIndex = schema?.findIndex(
    (f: any) => f.name === 'tribe' || f.name === 'tribes'
  );
  if (tribesSelectorIndex > -1) {
    // give "none" option
    schema[tribesSelectorIndex].options = [{ value: 'none', label: 'None' }];
    // add tribes
    main.ownerTribes?.length &&
      main.ownerTribes.forEach((ot: any) => {
        schema[tribesSelectorIndex].options.push({
          ...ot,
          value: ot.unique_name,
          label: ot.name
        });
      });
  }

  return (
    <Formik
      initialValues={initValues || {}}
      onSubmit={props.onSubmit}
      innerRef={props.formRef}
      validationSchema={validator(schema)}
    >
      {({ setFieldTouched, handleSubmit, values, setFieldValue, errors, initialValues }: any) => {
        const isDescriptionValid = values.ticket_url
          ? values.github_description || !!values.description
          : !!values.description;
        const github_state = values.github_description ? true : false;
        const valid = schemaData.required.every((key: string) =>
          key === '' ? true : values?.[key]
        );

        if (values.org_uuid !== '') {
          setFeatureid(values.feature_uuid);
          setWorskspaceid(values.org_uuid);
        }

        const isBtnDisabled = (stepTracker === 3 && !isDescriptionValid) || !valid;

        // returns the body of a form page
        // assuming two collumn layout
        const GetFormFields = (schemaData: any, style: any = {}) => (
          <>
            <div className="LeftSchema" style={style}>
              {schema
                .filter((item: any) => schemaData.schema.includes(item.name))
                .map((item: FormField) => (
                  <Input
                    {...item}
                    key={item.name}
                    type={
                      (item.name === 'isStakable' || item.name === 'stakeMin') && !isEnabled
                        ? 'hidden'
                        : item.type
                    }
                    newDesign={item.name === 'description' ? false : true}
                    values={values}
                    testId={item.name}
                    setAssigneefunction={item.name === 'assignee' && setAssigneeName}
                    peopleList={peopleList}
                    isFocused={isFocused}
                    errors={errors}
                    scrollToTop={scrollToTop}
                    github_state={github_state}
                    value={values[item.name]}
                    error={errors[item.name]}
                    initialValues={initialValues}
                    deleteErrors={() => {
                      if (errors[item.name]) delete errors[item.name];
                    }}
                    handleChange={(e: any) => {
                      setFieldValue(item.name, e);
                    }}
                    setFieldValue={(e: any, f: any) => {
                      setFieldValue(e, f);
                    }}
                    setFieldTouched={setFieldTouched}
                    handleBlur={() => {
                      setFieldTouched(item.name, false);
                      setIsFocused({ [item.label]: false });
                    }}
                    handleFocus={() => {
                      setFieldTouched(item.name, true);
                      setIsFocused({ [item.label]: true });
                    }}
                    setDisableFormButtons={setDisableFormButtons}
                    extraHTML={(props.extraHTML && props.extraHTML[item.name]) || item.extraHTML}
                    style={
                      item.name === 'github_description' && !values.ticket_url
                        ? {
                            display: 'none'
                          }
                        : undefined
                    }
                  />
                ))}
            </div>
            {schemaData.step !== 5 && (
              <div className="RightSchema" style={style}>
                {schema
                  .filter((item: any) => schemaData.schema2.includes(item.name))
                  .map((item: FormField) => {
                    const loomOffset =
                      item.type === 'loom' && values.ticket_url
                        ? {
                            marginTop: '55px'
                          }
                        : undefined;

                    return (
                      <Input
                        {...item}
                        peopleList={peopleList}
                        newDesign={true}
                        key={item.name}
                        values={values}
                        testId={item.label}
                        errors={errors}
                        github_state={github_state}
                        scrollToTop={scrollToTop}
                        value={values[item.name]}
                        error={errors[item.name]}
                        initialValues={initialValues}
                        deleteErrors={() => {
                          if (errors[item.name]) delete errors[item.name];
                        }}
                        isFocused={isFocused}
                        handleChange={(e: any) => {
                          setFieldValue(item.name, e);
                        }}
                        setFieldValue={(e: any, f: any) => {
                          setFieldValue(e, f);
                        }}
                        setFieldTouched={setFieldTouched}
                        handleBlur={() => {
                          setFieldTouched(item.name, false);
                          setIsFocused({ [item.label]: false });
                        }}
                        handleFocus={() => {
                          setFieldTouched(item.name, true);
                          setIsFocused({ [item.label]: true });
                        }}
                        setDisableFormButtons={setDisableFormButtons}
                        extraHTML={
                          (props.extraHTML && props.extraHTML[item.name]) || item.extraHTML
                        }
                        style={{
                          ...loomOffset
                        }}
                      />
                    );
                  })}
              </div>
            )}
          </>
        );

        return (
          <Wrap
            ref={refBody}
            style={{
              ...formPad,
              ...wrapStyle,
              ...schemaData.outerContainerStyle
            }}
            newDesign={props?.newDesign}
          >
            {props?.newDesign && schema ? (
              <>
                <CreateBountyHeaderContainer color={color}>
                  <div className="TopContainer">
                    <EuiText className="stepText">
                      {`STEP ${schemaData.step}`} <span className="stepTextSpan"> / 5</span>
                    </EuiText>
                    <EuiText className="schemaName">{schemaData.schemaName}</EuiText>
                  </div>
                  <EuiText className="HeadingText" style={schemaData.headingStyle}>
                    {schemaData.heading}
                  </EuiText>
                </CreateBountyHeaderContainer>

                {schemaData.step === 1 && dynamicSchema && (
                  <ChooseBountyContainer color={color}>
                    {dynamicFormOptions?.map((v: any) => (
                      <BountyContainer
                        key={v.label}
                        color={color}
                        show={v.value === 'freelance_job_request' ? true : false}
                      >
                        <div className="freelancerContainer">
                          <div
                            style={{
                              minHeight: '134px !important',
                              maxHeight: '134px !important',
                              height: '134px',
                              width: '290px',
                              background: color.white100,
                              borderRadius: '20px 20px 0px 0px'
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                position: 'relative'
                              }}
                            >
                              <img
                                src={
                                  v.value === 'freelance_job_request'
                                    ? '/static/freelancer_bounty.svg'
                                    : '/static/live_help.svg'
                                }
                                alt="select_type"
                                height={'114%'}
                                width={'114%'}
                                style={{
                                  position: 'absolute',
                                  top: '32px'
                                }}
                              />
                            </div>
                          </div>
                          <div className="TextButtonContainer">
                            <EuiText className="textTop">{v.label}</EuiText>
                            <EuiText className="textBottom">
                              {v.value === 'freelance_job_request'
                                ? 'Choose the right developer'
                                : 'Get instant help for your task'}
                            </EuiText>
                            {v.value === 'freelance_job_request' ? (
                              <div
                                className="StartButton"
                                onClick={() => {
                                  NextStepHandler();
                                  setDynamicSchemaName(v.value);
                                  setDynamicSchema(v.schema);
                                }}
                              >
                                Start
                              </div>
                            ) : (
                              <div className="ComingSoonContainer">
                                <Divider
                                  style={{
                                    width: '26px',
                                    background: color.grayish.G300
                                  }}
                                />
                                <EuiText className="ComingSoonText">Coming soon</EuiText>
                                <Divider
                                  style={{
                                    width: '26px',
                                    background: color.grayish.G300
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </BountyContainer>
                    ))}
                  </ChooseBountyContainer>
                )}

                {schemaData.step !== 1 && (
                  <div>
                    <SchemaTagsContainer style={{ display: 'flex', gap: '20px' }}>
                      <div className="LeftSchema" style={{ width: '100%' }}>
                        {schema
                          .filter((item: any) => schemaData.schema.includes(item.name))
                          .map((item: FormField) => (
                            <div
                              key={item.name}
                              style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: 'start',
                                gap: '10px'
                              }}
                            >
                              <Input
                                {...item}
                                type={
                                  (item.name === 'isStakable' || item.name === 'stakeMin') &&
                                  !isEnabled
                                    ? 'hidden'
                                    : item.type
                                }
                                newDesign={item.name === 'description' ? false : true}
                                values={values}
                                setAssigneefunction={item.name === 'assignee' && setAssigneeName}
                                peopleList={peopleList}
                                isFocused={isFocused}
                                errors={errors}
                                scrollToTop={scrollToTop}
                                value={values[item.name]}
                                error={errors[item.name]}
                                github_state={github_state}
                                initialValues={initialValues}
                                deleteErrors={() => {
                                  if (errors[item.name]) delete errors[item.name];
                                }}
                                handleChange={(e: any) => {
                                  setFieldValue(item.name, e);

                                  if (item.name === 'text_snippet') {
                                    const selectedSnippet = filteredSnippets.find(
                                      (snippet: {
                                        value: string;
                                        label: string;
                                        snippet: string;
                                      }) => snippet.value === e
                                    );
                                    if (selectedSnippet) {
                                      const existingDescription = values.description || '';
                                      const descriptionContent = `${existingDescription}\n\n${selectedSnippet.snippet}`;
                                      setFieldValue('description', descriptionContent.trim());
                                    }
                                  }
                                }}
                                setFieldValue={(e: any, f: any) => {
                                  setFieldValue(e, f);
                                }}
                                setFieldTouched={setFieldTouched}
                                handleBlur={() => {
                                  setFieldTouched(item.name, false);
                                  setIsFocused({ [item.label]: false });
                                }}
                                handleFocus={() => {
                                  setFieldTouched(item.name, true);
                                  setIsFocused({ [item.label]: true });
                                }}
                                setDisableFormButtons={setDisableFormButtons}
                                extraHTML={
                                  (props.extraHTML && props.extraHTML[item.name]) || item.extraHTML
                                }
                                style={
                                  item.name === 'github_description' && !values.ticket_url
                                    ? {
                                        display: 'none'
                                      }
                                    : undefined
                                }
                                label={
                                  item.name === 'description' && !values.ticket_url
                                    ? 'Description *'
                                    : item.label
                                }
                                placeholder={
                                  isDescriptionValid //checks if the description is taken from github. If yes, then the placeholder is empty
                                    ? ''
                                    : 'Provide some context and be as detailed as possible. The more information you provide the better. This will allow the hunter to have a fuller picture of the amount of work that is required to complete the task. Screenshots and screen recordings help a lot too!'
                                }
                              />

                              {item.name === 'issue_template' ? <RefineDescriptionModal /> : null}
                            </div>
                          ))}
                      </div>
                      <div className="RightSchema" style={{ width: '100%' }}>
                        {schema
                          .filter((item: any) => schemaData.schema2.includes(item.name))
                          .map((item: FormField) => (
                            <Input
                              {...item}
                              peopleList={peopleList}
                              newDesign={true}
                              key={item.name}
                              values={values}
                              testId={item.label}
                              errors={errors}
                              scrollToTop={scrollToTop}
                              value={values[item.name]}
                              error={errors[item.name]}
                              initialValues={initialValues}
                              github_state={github_state}
                              deleteErrors={() => {
                                if (errors[item.name]) delete errors[item.name];
                              }}
                              workspaceid={workspaceid}
                              isFocused={isFocused}
                              handleChange={(e: any) => {
                                setFieldValue(item.name, e);
                              }}
                              setFieldValue={(e: any, f: any) => {
                                setFieldValue(e, f);
                              }}
                              setFieldTouched={setFieldTouched}
                              handleBlur={() => {
                                setFieldTouched(item.name, false);
                                setIsFocused({ [item.label]: false });
                              }}
                              handleFocus={() => {
                                setFieldTouched(item.name, true);
                                setIsFocused({ [item.label]: true });
                              }}
                              setDisableFormButtons={setDisableFormButtons}
                              extraHTML={
                                (props.extraHTML && props.extraHTML[item.name]) || item.extraHTML
                              }
                              style={
                                item.type === 'loom' && values.ticket_url
                                  ? {
                                      marginTop: '55px'
                                    }
                                  : undefined
                              }
                            />
                          ))}
                      </div>
                    </SchemaTagsContainer>
                    <BottomContainer color={color} assigneeName={assigneeName} valid={valid}>
                      <EuiText className="RequiredText">{schemaData?.extraText}</EuiText>
                      <div
                        className="ButtonContainer"
                        style={{
                          width: stepTracker < 5 ? '20%' : '100%',
                          height: stepTracker < 5 ? '48px' : '48px',
                          marginTop: stepTracker === 5 || stepTracker === 3 ? '20px' : ''
                        }}
                      >
                        {isBtnDisabled && (
                          <div className="nextButtonDisable">
                            <EuiText className="disableText">Next</EuiText>
                          </div>
                        )}
                        {!isBtnDisabled && (
                          <div
                            className={props.submiting ? 'nextButtonDisable' : 'nextButton'}
                            onClick={() => {
                              if (schemaData.step === 5 && valid) {
                                if (dynamicSchemaName) {
                                  setFieldValue('type', dynamicSchemaName);
                                }
                                if (assigneeName !== '') {
                                  handleSubmit();
                                } else {
                                  setAssigneeName('a');
                                }
                              } else {
                                if (valid) {
                                  NextStepHandler();
                                }
                              }
                            }}
                            style={{
                              width:
                                schemaData.step === 5
                                  ? assigneeName === ''
                                    ? '145px'
                                    : '120px'
                                  : '120px'
                            }}
                          >
                            {assigneeName === '' ? (
                              <EuiText className="nextText">
                                {schemaData.step === 5 ? 'Decide Later' : 'Next'}
                              </EuiText>
                            ) : (
                              <EuiText className={props.submiting ? 'disableText' : 'nextText'}>
                                Finish
                              </EuiText>
                            )}
                          </div>
                        )}
                        {schemaData.step > 1 && (
                          <>
                            <ImageButton
                              buttonText={'Back'}
                              ButtonContainerStyle={{
                                width: '120px',
                                height: '42px'
                              }}
                              buttonAction={() => {
                                PreviousStepHandler();
                                setAssigneeName('');
                              }}
                            />
                          </>
                        )}
                      </div>
                    </BottomContainer>
                  </div>
                )}
              </>
            ) : (
              <SchemaOuterContainer>
                {isMobile ? (
                  <div className="SchemaInnerContainer">
                    {schema.map((item: FormField) => (
                      <div key={item.name}>
                        <Input
                          {...item}
                          key={item.name}
                          data-testid={item.name}
                          values={values}
                          errors={errors}
                          scrollToTop={scrollToTop}
                          value={values[item.name]}
                          error={errors[item.name]}
                          github_state={github_state}
                          initialValues={initialValues}
                          deleteErrors={() => {
                            if (errors[item.name]) delete errors[item.name];
                          }}
                          handleChange={(e: any) => {
                            setFieldValue(item.name, e);
                          }}
                          setFieldValue={(e: any, f: any) => {
                            setFieldValue(e, f);
                          }}
                          setFieldTouched={setFieldTouched}
                          isFocused={isFocused}
                          handleBlur={() => {
                            setFieldTouched(item.name, false);
                            setIsFocused({ [item.label]: false });
                          }}
                          handleFocus={() => {
                            setFieldTouched(item.name, true);
                            setIsFocused({ [item.label]: true });
                          }}
                          setDisableFormButtons={setDisableFormButtons}
                          extraHTML={
                            (props.extraHTML && props.extraHTML[item.name]) || item.extraHTML
                          }
                          style={{
                            ...(item.name === 'github_description' && !values.ticket_url
                              ? { display: 'none' }
                              : {}),
                            ...(item.name === 'loomEmbedUrl' ? { marginBottom: '1rem' } : {})
                          }}
                        />
                        {item.name === 'issue_template' ? <RefineDescriptionModal /> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: '#3C3D3F',
                      width: '100%',
                      padding: '0px 40px 0px 40px',
                      paddingTop: '0px',
                      height: '100vh'
                    }}
                  >
                    {/* mapping each bounty creation step to the appropriate
                      section heading */}
                    {[
                      BountyDetailsCreationData.step_2,
                      BountyDetailsCreationData.step_3,
                      BountyDetailsCreationData.step_4
                    ].map((section: any, index: number) => (
                      <div style={{ width: '100%' }} key={index}>
                        <h4 style={{ marginTop: '20px' }}>
                          <b>{section.heading}</b>
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          {GetFormFields(section, { width: '100%' })}
                        </div>
                      </div>
                    ))}
                    {[BountyDetailsCreationData.step_5].map((section: any, index: number) => (
                      <div style={{ width: '100%' }} key={index}>
                        <h4 style={{ marginTop: '20px' }}>
                          <b>{section.heading}</b>
                        </h4>
                        <div
                          style={{
                            width: '100%',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          {GetFormFields(section)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SchemaOuterContainer>
            )}
            {/* make space at bottom for first sign up */}
            {buttonsOnBottom && !smallForm && <div style={{ height: 48, minHeight: 48 }} />}
            {!props?.newDesign && (
              <BWrap style={buttonAlignment} color={color}>
                <EditBountyText>Edit Bounty</EditBountyText>
                <Button
                  disabled={disableFormButtons || props.loading}
                  onClick={() => {
                    if (props.close) props.close();
                  }}
                  color={'white'}
                  width={100}
                  text={'Cancel'}
                  style={{ ...buttonStyle, marginRight: 10, marginLeft: 'auto', width: '140px' }}
                />
                {!readOnly && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      disabled={disableFormButtons || props.loading}
                      onClick={async () => {
                        if (dynamicSchemaName) {
                          // inject type in body
                          setFieldValue('type', dynamicSchemaName);
                        }
                        await handleSubmit(true);
                        setTimeout(() => {
                          props.setLoading && props.setLoading(false);
                          props.onEditSuccess && props.onEditSuccess();
                        }, 500);
                      }}
                      loading={props.loading}
                      style={{ ...buttonStyle, width: '140px' }}
                      color={'primary'}
                      text={'Save'}
                    />
                  </div>
                )}
              </BWrap>
            )}
          </Wrap>
        );
      }}
    </Formik>
  );
}
export default observer(Form);
