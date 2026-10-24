import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateMilestone from '../pages/CreateMilestone';
import useRelationshipStore from '../store/relationshipStore';
import useMilestoneStore from '../store/milestoneStore';

vi.mock('../store/relationshipStore', () => ({ default: vi.fn() }));
vi.mock('../store/milestoneStore', () => ({ default: vi.fn() }));

describe('CreateMilestone', () => {
  it('renders category and difficulty selects and submits them', async () => {
    const createMilestone = vi.fn().mockResolvedValue({ success: true });
    useRelationshipStore.mockReturnValue({
      getRelationships: vi.fn(),
      relationships: [{ _id: 'rel1', status: 'active', title: 'Love', initiator: { _id: 'a', firstName: 'A', lastName: 'B' }, partner: { _id: 'b', firstName: 'C', lastName: 'D' } }],
    });
    useMilestoneStore.mockReturnValue({ createMilestone, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/milestones/new?relationshipId=rel1']}>
        <CreateMilestone />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trust' }));
    fireEvent.click(screen.getByRole('button', { name: /Hard/ }));
    fireEvent.change(screen.getByLabelText(/celebrating/i), { target: { value: 'First year' } });
    fireEvent.click(screen.getByRole('button', { name: /create milestone/i }));

    await vi.waitFor(() => expect(createMilestone).toHaveBeenCalled());
    expect(createMilestone.mock.calls[0][0]).toMatchObject({
      relationshipId: 'rel1',
      title: 'First year',
      category: 'trust_based',
      difficulty: 'hard',
    });
  });
});
