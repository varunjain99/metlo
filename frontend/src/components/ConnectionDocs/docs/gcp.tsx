import { Code, Heading, Box, Grid, VStack } from "@chakra-ui/react"
const GCPDocs = () => {
  return (
    <>
      <VStack w={"full"} spacing={6}>
        <Heading w={"full"} size={"md"}>
          Steps
        </Heading>

        <VStack w={"full"}>
          <Heading w={"full"} size={"sm"}>
            1. Open Ports
          </Heading>
          <Box w={"full"}>
            Open Port 8081 on your Metlo instance so you can start collecting
            traffic data. It should be open to any machines you want to collect
            traffic from.
          </Box>
        </VStack>

        <VStack w={"full"}>
          <Heading w={"full"} size={"sm"}>
            2. Deploy a Metlo Mirroring Instance
          </Heading>
          <Box w={"full"}>
            Run the following command to spin up Metlo in GCP:
          </Box>
          <Code w={"full"} p={2}>
            <VStack>
              <Box w={"full"}>
                $ export PROJECT_ID={'"<'}YOUR_PROJECT_ID{'>"'}
              </Box>
              <Box w={"full"}>
                $ gcloud compute instances create metlo-api-security
                --image-family=metlo-api-security --image-project=metlo-security
                --project=$PROJECT_ID --machine-type e2-standard-2
              </Box>
            </VStack>
          </Code>
          <Box w={"full"}>
            Once you&apos;ve launched your instance run the following in the
            instance to start Metlo:
          </Box>
          <Code w={"full"} p={2}>
            {" "}
            $ sudo metlo start
          </Code>
        </VStack>

        <VStack w={"full"}>
          <Heading w={"full"} size={"sm"}>
            3. Account Permissions
          </Heading>
          <Box w={"full"}>
            Metlo mirroring on GCP requires a service account with the following
            permissions:
          </Box>

          <VStack w={"full"}>
            <Box w={"full"}>
              Currently, we require these permissions for the service account:
            </Box>
            <Box w={"full"}>&nbsp;-&nbsp;Compute Admin</Box>
            <Box w={"full"}>&nbsp;-&nbsp;Compute packet mirroring admin</Box>
            <Box w={"full"}>&nbsp;-&nbsp;Compute packet mirroring user</Box>
            <Box w={"full"}>&nbsp;-&nbsp;IAP-secured Tunnel User</Box>
          </VStack>
        </VStack>
        <Box w={"full"}>
          <Heading size={"sm"} paddingBlock={2}>
            4. Install Metlo&apos;s CLI Tool
          </Heading>
          You can install metlo from npm by running the following:
        </Box>
        <Code w={"full"} p={2}>
          $ npm i -g @metlo/cli
        </Code>
        <Box w={"full"}>
          <Heading size={"sm"} paddingBlock={2}>
            5. Set up Traffic Mirroring
          </Heading>
          To set up traffic mirroring run the following:
          <Code w={"full"} p={2}>
            <VStack>
              <Box w={"full"}>$ metlo traffic-mirror gcp</Box>
              <Box w={"full"}>✔ GCP Project Name · metlo-security</Box>
              <Box w={"full"}>✔ GCP Network to mirror · default</Box>
              <Box w={"full"}>✔ Select your GCP zone · us-central1-a</Box>
              <Box w={"full"}>
                ✔ Path to GCP key file ·{"<"}PATH TO GCP KEY FILE{">"}
              </Box>
              <Box w={"full"}>✔ Validated account details</Box>
              <Box w={"full"}>Validated account details succesfully</Box>
              <Box w={"full"}>✔ Select your mirror source type · SUBNET</Box>
              <Box w={"full"}>
                ✔ Enter the mirror source subnet name · default
              </Box>
              <Box w={"full"}>✔ Verified mirror source details</Box>
              <Box w={"full"}>✔ Created destination subnet</Box>
              <Box w={"full"}>✔ Created Firewall rule</Box>
              <Box w={"full"}>✔ Obtained router details</Box>
              <Box w={"full"}>✔ Mirror Instance Type · e2-standard-2</Box>
              <Box w={"full"}>
                ✔ Metlo URL · {"<"}METLO_URL_HERE{">"}
              </Box>
              <Box w={"full"}>
                ✔ Metlo API Key · {"<"}METLO_API_KEY_HERE{">"}
              </Box>
              <Box w={"full"}>✔ Created MIG for metlo</Box>
              <Box w={"full"}>✔ Created health check</Box>
              <Box w={"full"}>
                ✔ Creating Backend service for packet mirroring
              </Box>
              <Box w={"full"}>✔ Created load balancer</Box>
              <Box w={"full"}>✔ Started packet mirroring</Box>
            </VStack>
          </Code>
        </Box>
      </VStack>
    </>
  )
}

export default GCPDocs