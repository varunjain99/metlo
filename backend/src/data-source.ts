import "dotenv/config"
import { DataSource } from "typeorm"
import {
  ApiEndpoint,
  DataField,
  ApiTrace,
  OpenApiSpec,
  Alert,
  Session,
  Connections,
  ApiEndpointTest,
  ApiKey,
  BlockFields,
  InstanceSettings,
  AuthenticationConfig,
  AggregateTraceDataHourly,
  Attack,
  Webhook,
  TestingConfig,
} from "models"
import { runMigration } from "utils"
import { initMigration1665782029662 } from "migrations/1665782029662-init-migration"
import { addUniqueConstraintApiEndpoint1666678487137 } from "migrations/1666678487137-add-unique-constraint-api-endpoint"
import { dropAnalyzedColumnFromApiTrace1666752646836 } from "migrations/1666752646836-drop-analyzed-column-from-api-trace"
import { addIndexForDataField1666941075032 } from "migrations/1666941075032-add-index-for-data-field"
import { addIsgraphqlColumnApiEndpoint1667095325334 } from "migrations/1667095325334-add-isgraphql-column-api-endpoint"
import { addApiEndpointUuidIndexForAlert1667259254414 } from "migrations/1667259254414-add-apiEndpointUuid-index-for-alert"
import { MetloConfig } from "models/metlo-config"
import { addMetloConfigTable1667599667595 } from "migrations/1667599667595-add-metlo-config-table"
import { updateDisabledPathsColumnBlockFieldsTable1667606447208 } from "migrations/1667606447208-update-disabledPaths-column-blockFields-table"
import { removeApiKeyTypeEnum1669778297643 } from "migrations/1669778297643-remove-apiKeyType-enum"
import { addWebhookTable1670447292139 } from "migrations/1670447292139-add-webhook-table"
import { addEndpointIps1670653006577 } from "migrations/1670653006577-add_endpoint_ips"
import { addHostsColumnToWebhook1671143857165 } from "migrations/1671143857165-add-hosts-column-to-webhook"
import { addApiSpecColumnsToDataField1671511060114 } from "migrations/1671511060114-add-api-spec-columns-to-data-field"
import { addUniqueNullIndexForDataField1671609270282 } from "migrations/1671609270282-add-unique-null-index-for-data-field"
import { customDataClasses1671813043343 } from "migrations/1671813043343-custom-data-classes"
import { dataFieldUniqueConstraint1672708787156 } from "migrations/1672708787156-data-field-unique-constraint"
import { addTracehashColumnToDataField1672962660470 } from "migrations/1672962660470-add-tracehash-column-to-data-field"
import { userSetEndpointColumn1673073826153 } from "migrations/1673073826153-user-set-endpoint-column"
import { removeHostPrimaryKeyAuthenticationconfig1673465613593 } from "migrations/1673465613593-remove-host-primary-key-authenticationconfig"
import { metloConfigEnv1673503553138 } from "migrations/1673503553138-metloConfigEnv"
import { addHostAndMethodIndex1676006521189 } from "migrations/1676006521189-add-host-and-method-index"
import { addFullTraceCaptureEnabledColumn1676065168441 } from "migrations/1676065168441-addFullTraceCaptureEnabledColumn"
import { addOriginalHostTraceColumn1676358211583 } from "migrations/1676358211583-addOriginalHostTraceColumn"
import { addTestingConfigTable1676508983994 } from "migrations/1676508983994-add-testing-config-table"

export const AppDataSource: DataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  entities: [
    ApiEndpoint,
    DataField,
    ApiTrace,
    OpenApiSpec,
    Alert,
    Session,
    Connections,
    ApiEndpointTest,
    ApiKey,
    BlockFields,
    InstanceSettings,
    AuthenticationConfig,
    AggregateTraceDataHourly,
    Attack,
    MetloConfig,
    Webhook,
    TestingConfig,
  ],
  synchronize: false,
  migrations: [
    initMigration1665782029662,
    addUniqueConstraintApiEndpoint1666678487137,
    dropAnalyzedColumnFromApiTrace1666752646836,
    addIndexForDataField1666941075032,
    addIsgraphqlColumnApiEndpoint1667095325334,
    addApiEndpointUuidIndexForAlert1667259254414,
    addMetloConfigTable1667599667595,
    updateDisabledPathsColumnBlockFieldsTable1667606447208,
    removeApiKeyTypeEnum1669778297643,
    addWebhookTable1670447292139,
    addEndpointIps1670653006577,
    addHostsColumnToWebhook1671143857165,
    addApiSpecColumnsToDataField1671511060114,
    addUniqueNullIndexForDataField1671609270282,
    customDataClasses1671813043343,
    dataFieldUniqueConstraint1672708787156,
    addTracehashColumnToDataField1672962660470,
    userSetEndpointColumn1673073826153,
    removeHostPrimaryKeyAuthenticationconfig1673465613593,
    metloConfigEnv1673503553138,
    addHostAndMethodIndex1676006521189,
    addFullTraceCaptureEnabledColumn1676065168441,
    addOriginalHostTraceColumn1676358211583,
    addTestingConfigTable1676508983994,
  ],
  migrationsRun: runMigration,
  logging: false,
})
