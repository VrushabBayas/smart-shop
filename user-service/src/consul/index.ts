import Consul from 'consul';
import env from '../../env';

const consul = new Consul({
  host: env.CONSUL_HOST || 'localhost',
  port: env.CONSUL_PORT,
});

export const registerService = async () => {
  const serviceName = env.SERVICE_NAME;
  const servicePort = env.PORT;
  await consul.agent.service.register({
    name: serviceName,
    address: serviceName,
    port: servicePort,
    checks: [
      {
        name: `${serviceName} health check`,
        http: `http://${serviceName}:${servicePort}/health`,
        interval: '10s',
        timeout: '5s',
      },
    ],
  });
  console.log(`✅ Registered service ${serviceName} with Consul`);
};

export const deregisterService = async () => {
  const serviceName = env.SERVICE_NAME || 'user-service';
  await consul.agent.service.deregister(serviceName);
  console.log(`🛑 Deregistered service ${serviceName} from Consul`);
};

export default consul;
