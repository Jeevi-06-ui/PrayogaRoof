import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../src/components/shared/Button';
import { Badge } from '../src/components/shared/Badge';
import { SubjectCard } from '../src/components/shared/SubjectCard';
import { EmptyState } from '../src/components/shared/EmptyState';
import { Tabs } from '../src/components/shared/Tabs';
import { getSubjectById } from '../src/services/experimentRegistry';

describe('Shared UI Components', () => {
  it('renders Button with variants and handles clicks', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" onClick={handleClick}>
        Launch Laboratory
      </Button>
    );

    const btn = screen.getByRole('button', { name: /launch laboratory/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Button loading state correctly', () => {
    render(<Button isLoading>Saving Notes</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders Badge with variants and dot indicator', () => {
    const { container } = render(
      <Badge variant="success" dot>
        Active
      </Badge>
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(container.querySelector('span.w-1\\.5')).toBeInTheDocument();
  });

  it('renders SubjectCard with active status and progress', () => {
    const physics = getSubjectById('physics')!;
    render(
      <BrowserRouter>
        <SubjectCard subject={physics} completedCount={2} />
      </BrowserRouter>
    );

    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('Active Lab')).toBeInTheDocument();
    expect(screen.getByText(/2 of 5 completed/i)).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders SubjectCard with Coming Soon for Biology', () => {
    const biology = getSubjectById('biology')!;
    render(
      <BrowserRouter>
        <SubjectCard subject={biology} />
      </BrowserRouter>
    );

    expect(screen.getByText('Biology')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders EmptyState and triggers action', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Saved Workspaces"
        description="Create your first workspace to begin testing circuits."
        actionLabel="Create Workspace"
        onAction={onAction}
      />
    );

    expect(screen.getByText('No Saved Workspaces')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /create workspace/i });
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders Tabs and handles tab switching', () => {
    const handleChange = vi.fn();
    const tabs = [
      { id: 'guided', label: 'Guided Mode' },
      { id: 'freelab', label: 'Free Lab' },
    ];

    render(
      <Tabs tabs={tabs} activeTab="guided" onChange={handleChange} />
    );

    const freelabBtn = screen.getByRole('button', { name: /free lab/i });
    fireEvent.click(freelabBtn);
    expect(handleChange).toHaveBeenCalledWith('freelab');
  });
});
