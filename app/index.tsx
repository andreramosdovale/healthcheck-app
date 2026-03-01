import { Text, YStack, Button, Spinner } from "tamagui";
import { useHealthCheck } from "../src/hooks/useHealthCheck";

export default function Home() {
  const { data, isLoading, isError, refetch } = useHealthCheck();

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$4"
      gap="$4"
    >
      <Text fontSize="$6" fontWeight="bold">
        HealthCheck App
      </Text>

      {isLoading && <Spinner size="large" />}

      {isError && (
        <>
          <Text color="$red10">❌ API não conectada</Text>
          <Text fontSize="$2">Verifique se o backend está rodando</Text>
        </>
      )}

      {data && <Text color="$green10">✅ API conectada!</Text>}

      <Button onPress={() => refetch()}>Testar conexão</Button>
    </YStack>
  );
}
