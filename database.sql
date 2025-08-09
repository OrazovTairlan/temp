-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.approved_publishers (
                                          id integer NOT NULL DEFAULT nextval('approved_publishers_id_seq'::regclass),
                                          publisher_name character varying NOT NULL UNIQUE,
                                          CONSTRAINT approved_publishers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.departments (
                                  id integer NOT NULL DEFAULT nextval('departments_id_seq'::regclass),
                                  name character varying NOT NULL UNIQUE,
                                  CONSTRAINT departments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.employees (
                                id integer NOT NULL DEFAULT nextval('employees_id_seq'::regclass),
                                full_name character varying NOT NULL,
                                position_id integer,
                                start_date date NOT NULL,
                                department_id integer,
                                CONSTRAINT employees_pkey PRIMARY KEY (id),
                                CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES public.departments(id),
                                CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id)
);
CREATE TABLE public.enum_coaching_activity_types (
                                                   id integer NOT NULL DEFAULT nextval('enum_coaching_activity_types_id_seq'::regclass),
                                                   activity_name character varying NOT NULL UNIQUE,
                                                   CONSTRAINT enum_coaching_activity_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enum_event_levels (
                                        id integer NOT NULL DEFAULT nextval('enum_event_levels_id_seq'::regclass),
                                        level_name character varying NOT NULL UNIQUE,
                                        CONSTRAINT enum_event_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enum_mentorship_results (
                                              id integer NOT NULL DEFAULT nextval('enum_mentorship_results_id_seq'::regclass),
                                              result_name character varying NOT NULL UNIQUE,
                                              CONSTRAINT enum_mentorship_results_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enum_publication_types (
                                             id integer NOT NULL DEFAULT nextval('enum_publication_types_id_seq'::regclass),
                                             type_name character varying NOT NULL UNIQUE,
                                             CONSTRAINT enum_publication_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enum_quartiles (
                                     id integer NOT NULL DEFAULT nextval('enum_quartiles_id_seq'::regclass),
                                     quartile_name character varying NOT NULL UNIQUE,
                                     CONSTRAINT enum_quartiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enum_university_service_types (
                                                    id integer NOT NULL DEFAULT nextval('enum_university_service_types_id_seq'::regclass),
                                                    service_name character varying NOT NULL UNIQUE,
                                                    CONSTRAINT enum_university_service_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.files (
                            id integer NOT NULL DEFAULT nextval('files_id_seq'::regclass),
                            file_name character varying NOT NULL,
                            file_path text NOT NULL UNIQUE,
                            file_type character varying,
                            file_size_bytes bigint,
                            upload_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT files_pkey PRIMARY KEY (id)
);
CREATE TABLE public.files_demo (
                                 id integer NOT NULL DEFAULT nextval('files_demo_id_seq'::regclass),
                                 file_name character varying NOT NULL,
                                 file_path text NOT NULL UNIQUE,
                                 file_type character varying,
                                 file_size_bytes bigint,
                                 upload_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                                 CONSTRAINT files_demo_pkey PRIMARY KEY (id)
);
CREATE TABLE public.kpi_acm_coaching (
                                       id integer NOT NULL DEFAULT nextval('kpi_acm_coaching_id_seq'::regclass),
                                       submission_id integer NOT NULL UNIQUE,
                                       activity_type_id integer NOT NULL,
                                       event_name character varying,
                                       number_of_teams integer,
                                       number_of_participants integer,
                                       result_details text,
                                       activity_date date,
                                       CONSTRAINT kpi_acm_coaching_pkey PRIMARY KEY (id),
                                       CONSTRAINT kpi_acm_coaching_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id),
                                       CONSTRAINT kpi_acm_coaching_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.enum_coaching_activity_types(id)
);
CREATE TABLE public.kpi_blocks (
                                 id integer NOT NULL DEFAULT nextval('kpi_blocks_id_seq'::regclass),
                                 block_name character varying NOT NULL UNIQUE,
                                 CONSTRAINT kpi_blocks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.kpi_blocks_demo (
                                      id integer NOT NULL DEFAULT nextval('kpi_blocks_demo_id_seq'::regclass),
                                      block_name character varying NOT NULL UNIQUE,
                                      CONSTRAINT kpi_blocks_demo_pkey PRIMARY KEY (id)
);
CREATE TABLE public.kpi_educational_resources (
                                                id integer NOT NULL DEFAULT nextval('kpi_educational_resources_id_seq'::regclass),
                                                submission_id integer NOT NULL UNIQUE,
                                                resource_title character varying NOT NULL,
                                                platform character varying,
                                                total_video_hours numeric,
                                                publication_link text,
                                                launch_date date,
                                                CONSTRAINT kpi_educational_resources_pkey PRIMARY KEY (id),
                                                CONSTRAINT kpi_educational_resources_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_funding_projects (
                                           id integer NOT NULL DEFAULT nextval('kpi_funding_projects_id_seq'::regclass),
                                           submission_id integer NOT NULL UNIQUE,
                                           project_title text NOT NULL,
                                           project_type character varying,
                                           role_in_project character varying DEFAULT 'Руководитель проекта'::character varying,
                                           funding_amount_kzt numeric NOT NULL,
                                           field_of_science character varying,
                                           funding_source text,
                                           grant_period_start date,
                                           grant_period_end date,
                                           CONSTRAINT kpi_funding_projects_pkey PRIMARY KEY (id),
                                           CONSTRAINT kpi_funding_projects_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_indicators (
                                     id integer NOT NULL DEFAULT nextval('kpi_indicators_id_seq'::regclass),
                                     block_id integer NOT NULL,
                                     indicator_description text NOT NULL,
                                     target_value character varying,
                                     CONSTRAINT kpi_indicators_pkey PRIMARY KEY (id),
                                     CONSTRAINT kpi_indicators_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.kpi_blocks(id)
);
CREATE TABLE public.kpi_indicators_demo (
                                          id integer NOT NULL DEFAULT nextval('kpi_indicators_demo_id_seq'::regclass),
                                          block_id integer NOT NULL,
                                          indicator_description text NOT NULL,
                                          target_value character varying,
                                          CONSTRAINT kpi_indicators_demo_pkey PRIMARY KEY (id),
                                          CONSTRAINT kpi_indicators_demo_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.kpi_blocks_demo(id)
);
CREATE TABLE public.kpi_mentorships (
                                      id integer NOT NULL DEFAULT nextval('kpi_mentorships_id_seq'::regclass),
                                      submission_id integer NOT NULL UNIQUE,
                                      project_or_team_name text NOT NULL,
                                      student_names text,
                                      event_name character varying NOT NULL,
                                      event_level_id integer,
                                      result_id integer,
                                      event_date date,
                                      CONSTRAINT kpi_mentorships_pkey PRIMARY KEY (id),
                                      CONSTRAINT kpi_mentorships_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id),
                                      CONSTRAINT kpi_mentorships_event_level_id_fkey FOREIGN KEY (event_level_id) REFERENCES public.enum_event_levels(id),
                                      CONSTRAINT kpi_mentorships_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.enum_mentorship_results(id)
);
CREATE TABLE public.kpi_patents (
                                  id integer NOT NULL DEFAULT nextval('kpi_patents_id_seq'::regclass),
                                  submission_id integer NOT NULL UNIQUE,
                                  patent_title text NOT NULL,
                                  patent_type character varying DEFAULT 'Patent'::character varying,
                                  registration_number character varying,
                                  registration_date date,
                                  is_aitu_rightholder boolean DEFAULT true,
                                  CONSTRAINT kpi_patents_pkey PRIMARY KEY (id),
                                  CONSTRAINT kpi_patents_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_publications (
                                       id integer NOT NULL DEFAULT nextval('kpi_publications_id_seq'::regclass),
                                       submission_id integer NOT NULL UNIQUE,
                                       publication_type_id integer,
                                       title text NOT NULL,
                                       authors text,
                                       publication_name character varying,
                                       publisher_id integer,
                                       publication_date date,
                                       status character varying,
                                       quartile_id integer,
                                       percentile integer,
                                       database_name character varying,
                                       personal_contribution_sheets numeric,
                                       total_copies_printed integer,
                                       recommendation_body text,
                                       doi_or_link text,
                                       is_affiliated_with_aitu boolean DEFAULT true,
                                       CONSTRAINT kpi_publications_pkey PRIMARY KEY (id),
                                       CONSTRAINT kpi_publications_publication_type_id_fkey FOREIGN KEY (publication_type_id) REFERENCES public.enum_publication_types(id),
                                       CONSTRAINT kpi_publications_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.approved_publishers(id),
                                       CONSTRAINT kpi_publications_quartile_id_fkey FOREIGN KEY (quartile_id) REFERENCES public.enum_quartiles(id),
                                       CONSTRAINT kpi_publications_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_research_supervision (
                                               id integer NOT NULL DEFAULT nextval('kpi_research_supervision_id_seq'::regclass),
                                               submission_id integer NOT NULL UNIQUE,
                                               student_full_name character varying NOT NULL,
                                               phd_program_title character varying,
                                               supervision_start_date date,
                                               CONSTRAINT kpi_research_supervision_pkey PRIMARY KEY (id),
                                               CONSTRAINT kpi_research_supervision_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_sports_coaching (
                                          id integer NOT NULL DEFAULT nextval('kpi_sports_coaching_id_seq'::regclass),
                                          submission_id integer NOT NULL UNIQUE,
                                          activity_type_id integer NOT NULL,
                                          sport_name character varying,
                                          event_name character varying,
                                          event_level_id integer,
                                          result_achieved_id integer,
                                          activity_date date,
                                          CONSTRAINT kpi_sports_coaching_pkey PRIMARY KEY (id),
                                          CONSTRAINT kpi_sports_coaching_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id),
                                          CONSTRAINT kpi_sports_coaching_result_achieved_id_fkey FOREIGN KEY (result_achieved_id) REFERENCES public.enum_mentorship_results(id),
                                          CONSTRAINT kpi_sports_coaching_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.enum_coaching_activity_types(id),
                                          CONSTRAINT kpi_sports_coaching_event_level_id_fkey FOREIGN KEY (event_level_id) REFERENCES public.enum_event_levels(id)
);
CREATE TABLE public.kpi_sports_coaching_demo (
                                               id integer NOT NULL DEFAULT nextval('kpi_sports_coaching_demo_id_seq'::regclass),
                                               submission_id integer NOT NULL UNIQUE,
                                               activity_type_id integer NOT NULL,
                                               sport_name character varying,
                                               event_name character varying,
                                               event_level_id integer,
                                               result_achieved_id integer,
                                               activity_date date,
                                               CONSTRAINT kpi_sports_coaching_demo_pkey PRIMARY KEY (id),
                                               CONSTRAINT kpi_sports_coaching_activity_type_demo_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.enum_coaching_activity_types(id),
                                               CONSTRAINT kpi_sports_coaching_result_achieved_demo_id_fkey FOREIGN KEY (result_achieved_id) REFERENCES public.enum_mentorship_results(id),
                                               CONSTRAINT kpi_sports_coaching_submission_demo_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions_demo(id),
                                               CONSTRAINT kpi_sports_coaching_event_level_demo_id_fkey FOREIGN KEY (event_level_id) REFERENCES public.enum_event_levels(id)
);
CREATE TABLE public.kpi_teaching_quality_evaluations (
                                                       id integer NOT NULL DEFAULT nextval('kpi_teaching_quality_evaluations_id_seq'::regclass),
                                                       employee_id integer NOT NULL,
                                                       academic_year character varying NOT NULL,
                                                       student_survey_percentage numeric,
                                                       director_assessment_details text,
                                                       evaluation_date date,
                                                       CONSTRAINT kpi_teaching_quality_evaluations_pkey PRIMARY KEY (id),
                                                       CONSTRAINT kpi_teaching_quality_evaluations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.kpi_university_service (
                                             id integer NOT NULL DEFAULT nextval('kpi_university_service_id_seq'::regclass),
                                             submission_id integer NOT NULL UNIQUE,
                                             service_type_id integer NOT NULL,
                                             name_or_topic text NOT NULL,
                                             role character varying,
                                             description text,
                                             event_date date,
                                             item_count integer,
                                             CONSTRAINT kpi_university_service_pkey PRIMARY KEY (id),
                                             CONSTRAINT kpi_university_service_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.enum_university_service_types(id),
                                             CONSTRAINT kpi_university_service_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.kpi_university_service_demo (
                                                  id integer NOT NULL DEFAULT nextval('kpi_university_service_demo_id_seq'::regclass),
                                                  submission_id integer NOT NULL UNIQUE,
                                                  service_type_id integer NOT NULL,
                                                  name_or_topic text NOT NULL,
                                                  role character varying,
                                                  description text,
                                                  event_date date,
                                                  item_count integer,
                                                  CONSTRAINT kpi_university_service_demo_pkey PRIMARY KEY (id),
                                                  CONSTRAINT kpi_university_service_service_type_demo_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.enum_university_service_types(id),
                                                  CONSTRAINT kpi_university_service_submission_demo_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions_demo(id)
);
CREATE TABLE public.position_kpi_mapping (
                                           position_id integer NOT NULL,
                                           indicator_id integer NOT NULL,
                                           weight_percentage integer NOT NULL,
                                           CONSTRAINT position_kpi_mapping_pkey PRIMARY KEY (position_id, indicator_id),
                                           CONSTRAINT position_kpi_mapping_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.kpi_indicators(id),
                                           CONSTRAINT position_kpi_mapping_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id)
);
CREATE TABLE public.position_kpi_mapping_demo (
                                                position_id integer NOT NULL,
                                                indicator_id integer NOT NULL,
                                                weight_percentage integer NOT NULL,
                                                CONSTRAINT position_kpi_mapping_demo_pkey PRIMARY KEY (position_id, indicator_id),
                                                CONSTRAINT position_kpi_mapping_position_demo_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id),
                                                CONSTRAINT position_kpi_mapping_indicator_demo_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.kpi_indicators_demo(id)
);
CREATE TABLE public.positions (
                                id integer NOT NULL DEFAULT nextval('positions_id_seq'::regclass),
                                position_name character varying NOT NULL UNIQUE,
                                CONSTRAINT positions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.submission_files (
                                       submission_id integer NOT NULL,
                                       file_id integer NOT NULL,
                                       CONSTRAINT submission_files_pkey PRIMARY KEY (submission_id, file_id),
                                       CONSTRAINT submission_files_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id),
                                       CONSTRAINT submission_files_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id)
);
CREATE TABLE public.submission_files_demo (
                                            submission_id integer NOT NULL,
                                            file_id integer NOT NULL,
                                            CONSTRAINT submission_files_demo_pkey PRIMARY KEY (submission_id, file_id),
                                            CONSTRAINT submission_files_file_demo_id_fkey FOREIGN KEY (file_id) REFERENCES public.files_demo(id),
                                            CONSTRAINT submission_files_submission_demo_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions_demo(id)
);
CREATE TABLE public.submissions (
                                  id integer NOT NULL DEFAULT nextval('submissions_id_seq'::regclass),
                                  employee_id integer NOT NULL,
                                  indicator_id integer NOT NULL,
                                  submission_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                                  status character varying NOT NULL DEFAULT 'Submitted'::character varying,
                                  previous_indicator_id integer,
                                  change_reason text,
                                  change_date timestamp with time zone,
                                  commission_status text DEFAULT 'Not reviewed'::text,
                                  comment text,
                                  CONSTRAINT submissions_pkey PRIMARY KEY (id),
                                  CONSTRAINT submissions_indicator_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.kpi_indicators(id),
                                  CONSTRAINT fk_submissions_previous_indicator_id FOREIGN KEY (previous_indicator_id) REFERENCES public.kpi_indicators(id),
                                  CONSTRAINT submissions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
CREATE TABLE public.submissions_demo (
                                       id integer NOT NULL DEFAULT nextval('submissions_demo_id_seq'::regclass),
                                       employee_id integer NOT NULL,
                                       indicator_id integer NOT NULL,
                                       submission_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                                       status character varying NOT NULL DEFAULT 'Submitted'::character varying,
                                       previous_indicator_id integer,
                                       change_reason text,
                                       change_date timestamp with time zone,
                                       commission_status text DEFAULT 'Not reviewed'::text,
                                       comment text,
                                       CONSTRAINT submissions_demo_pkey PRIMARY KEY (id),
                                       CONSTRAINT submissions_indicator_demo_id_fkey FOREIGN KEY (indicator_id) REFERENCES public.kpi_indicators_demo(id),
                                       CONSTRAINT submissions_employee_demo_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
                                       CONSTRAINT fk_submissions_previous_indicator_demo_id FOREIGN KEY (previous_indicator_id) REFERENCES public.kpi_indicators_demo(id)
);
CREATE TABLE public.users (
                            id uuid NOT NULL DEFAULT gen_random_uuid(),
                            employee_id integer NOT NULL UNIQUE,
                            email character varying NOT NULL UNIQUE,
                            password_hash character varying NOT NULL,
                            role character varying NOT NULL DEFAULT 'employee'::character varying,
                            created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                            updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT users_pkey PRIMARY KEY (id),
                            CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id)
);
