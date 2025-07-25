import React, { useState } from 'react';
import { MantineProvider, AppShell, Container, Title, Card, Select, Textarea, Button, Group, Paper, Text, Center, Stack } from '@mantine/core';
import { IconPlus, IconDatabase, IconHistory } from '@tabler/icons-react';

// Main App
export default function App() {
  const [taskType, setTaskType] = useState<string>("");
  const [taskData, setTaskData] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  const taskTypes = [
    { value: "ping", label: "Ping - Test network connectivity" },
    { value: "dns_lookup", label: "DNS Lookup - Resolve domain names" },
    { value: "katana", label: "Web Crawler - Crawl website and extract URLs" }
  ];

  const tabs = [
    { id: "tasks", label: "Task Manager", icon: IconPlus },
    { id: "dashboard", label: "Dashboard", icon: IconDatabase },
    { id: "history", label: "Task History", icon: IconHistory }
  ];

  const handleCreateTask = () => {
    if (!taskType) {
      alert('Please select a task type');
      return;
    }
    if (!taskData.trim()) {
      alert('Please enter task data');
      return;
    }
    
    alert(`Task created!\nType: ${taskType}\nData: ${taskData}`);
    setTaskType("");
    setTaskData("");
  };

  return (
    <MantineProvider>
      {/* Clock widget */}
      <Paper 
        withBorder 
        p="md" 
        radius="md" 
        style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 1000 
        }}
      >
        <Text size="lg" fw={600}>
          {new Date().toLocaleTimeString('tr-TR')}
        </Text>
        <Text size="sm" c="dimmed">
          İyi Geceler
        </Text>
      </Paper>

      <AppShell
        header={{ height: 70 }}
        padding="md"
      >
        <AppShell.Header>
          <Group justify="center" h="100%" px="md">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "filled" : "subtle"}
                  leftSection={<Icon size={16} />}
                  onClick={() => setActiveTab(tab.id)}
                  size="sm"
                >
                  {tab.label}
                </Button>
              );
            })}
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="md">
            {activeTab === "tasks" && (
              <Stack gap="xl">
                <Title order={1} ta="center">
                  Modern Task Manager
                </Title>
                
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Title order={2} mb="lg">Create New Task</Title>
                  
                  <Stack gap="md">
                    <Select
                      label="Task Type"
                      placeholder="Select Task Type"
                      value={taskType}
                      onChange={(value) => setTaskType(value || "")}
                      data={taskTypes}
                    />
                    
                    <Textarea
                      label="Task Data"
                      placeholder="Enter task data here..."
                      value={taskData}
                      onChange={(e) => setTaskData(e.target.value)}
                      rows={4}
                    />
                    
                    <Button 
                      leftSection={<IconPlus size={16} />}
                      onClick={handleCreateTask} 
                      loading={loading}
                      fullWidth
                      size="md"
                    >
                      Create Task
                    </Button>
                  </Stack>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Text ta="center" size="lg">
                    Task Status: Ready to create amazing tasks! 
                  </Text>
                  <Text ta="center" size="sm" c="dimmed" mt="sm">
                    Select a task type and enter your data above
                  </Text>
                </Card>
              </Stack>
            )}

            {activeTab === "dashboard" && (
              <Stack gap="xl">
                <Title order={1} ta="center">Dashboard</Title>
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Text ta="center">Dashboard features coming soon...</Text>
                </Card>
              </Stack>
            )}

            {activeTab === "history" && (
              <Stack gap="xl">
                <Title order={1} ta="center"> Task History</Title>
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Text ta="center">Task history will be shown here...</Text>
                </Card>
              </Stack>
            )}
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
