import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import useAuthStore from '../store/authStore';
import useRelationshipStore from '../store/relationshipStore';
import { toast } from 'react-toastify';

// Mock the zustand stores
vi.mock('../store/authStore', () => ({
  default: vi.fn(),
}));

vi.mock('../store/relationshipStore', () => ({
  default: vi.fn(),
}));

describe('Dashboard', () => {
  const mockUser = {
    firstName: 'John',
    lastName: 'Doe',
    registrationId: 'ABC123XYZ',
    historyPrivacy: 'private',
    email: 'john.doe@example.com',
    username: 'johndoe',
    avatar: '',
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        milestones: true,
        activities: true,
      },
    },
  };

  const mockRelationships = [
    {
      _id: 'rel1',
      initiator: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
      partner: { _id: 'user2', firstName: 'Jane', lastName: 'Smith' },
      status: 'active',
      type: 'romantic_interest',
      title: 'Love Story',
      stats: { trustLevel: 80, totalActivities: 5, milestonesAchieved: 2 },
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      _id: 'rel2',
      initiator: { _id: 'user3', firstName: 'Alice', lastName: 'Wonder' },
      partner: { _id: 'user1', firstName: 'John', lastName: 'Doe' },
      status: 'pending',
      type: 'friend',
      title: 'Friendship Request',
      createdAt: '2023-02-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: () => true,
      getMe: vi.fn(),
    });

    useRelationshipStore.mockReturnValue({
      relationships: mockRelationships,
      getRelationships: vi.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display the user's registration ID", () => {
    render(
      <Router>
        <Dashboard />
      </Router>
    );

    expect(screen.getByText(/Your Registration ID/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.registrationId)).toBeInTheDocument();
  });

  it('should copy the registration ID to clipboard when button is clicked', async () => {
    render(
      <Router>
        <Dashboard />
      </Router>
    );

    const copyButton = screen.getByTitle('Copy Registration ID');
    await fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUser.registrationId);
    expect(toast.success).toHaveBeenCalledWith('Registration ID copied to clipboard!');
  });

  it('should show an error toast if copying to clipboard fails', async () => {
    navigator.clipboard.writeText.mockImplementationOnce(() => {
      throw new Error('Failed to copy');
    });

    render(
      <Router>
        <Dashboard />
      </Router>
    );

    const copyButton = screen.getByTitle('Copy Registration ID');
    await fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUser.registrationId);
    expect(toast.error).toHaveBeenCalledWith('Failed to copy Registration ID.');
  });
});




