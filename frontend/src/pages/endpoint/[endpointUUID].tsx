import superjson from "superjson";
import { GetServerSideProps } from "next";
import { SideNavLinkDestination } from "../../components/Sidebar/NavLinkUtils";
import { SidebarLayoutShell } from "../../components/SidebarLayoutShell";
import { testEndpoints } from "../../testData";
import EndpointPage from "../../components/Endpoint";
import { Endpoint } from "@common/types";

const Endpoint = ({ endpoint }) => {
  return (
    <SidebarLayoutShell currentTab={SideNavLinkDestination.Endpoints}>
      <EndpointPage endpoint={superjson.parse<Endpoint>(endpoint)} />
    </SidebarLayoutShell>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const endpoint = testEndpoints.find(
    (e) => e.uuid == context.query.endpointUUID
  );
  return { props: { endpoint: superjson.stringify(endpoint) } };
};

export default Endpoint;
