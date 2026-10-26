import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  const link = () => `${window.location.origin}/connect/${mockUser.registrationId}`;
  const renderDashboard = () => render(<Router><Dashboard /></Router>);

  it('shows the invite link and the Registration ID', () => {
    renderDashboard();
    expect(screen.getByLabelText('Your invite link')).toHaveTextContent(link());
    expect(screen.getByText(mockUser.registrationId)).toBeInTheDocument();
  });

  it('copies the invite link when Copy link is pressed', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Invite link copied'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link());
  });

  it('copies the Registration ID when it is pressed', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: `Copy Registration ID ${mockUser.registrationId}` }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Registration ID copied'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUser.registrationId);
  });

  it('shows an error toast if copying fails', async () => {
    navigator.clipboard.writeText.mockImplementationOnce(() => { throw new Error('Failed to copy'); });
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Could not copy. Select the text and copy it by hand.'));
  });

  it('shows a get-started guide to someone with no relationships yet', () => {
    useRelationshipStore.mockReturnValue({ relationships: [], getRelationships: vi.fn(), isLoading: false });
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Get started in three steps' })).toBeInTheDocument();
    expect(screen.getByText('Welcome to Twogether. Three steps and you are set up.')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Your invite link')).toHaveLength(1);
  });
});
