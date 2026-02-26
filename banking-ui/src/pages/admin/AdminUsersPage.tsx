import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusChip } from '@/components/common/StatusChip';
import { ROUTES } from '@/constants/routes';
import { useDeactivateUser, useUsers } from '@/hooks/useUsers';
import type { User, UserStatus } from '@/types/user';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getRoleChip = (role: User['role']) =>
	role === 'admin' ? (
		<Chip label="Admin" size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24, borderRadius: '6px' }} />
	) : (
		<Chip label="User" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24, borderRadius: '6px' }} />
	);

const getDisplayName = (user: User) => {
	const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
	return full || user.username || user.email || '—';
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const AdminUsersPage = () => {
	const navigate = useNavigate();
	const { user: clerkUser } = useUser();

	// -------------------------------------------------------------------------
	// Filter state
	// -------------------------------------------------------------------------
	const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

	// -------------------------------------------------------------------------
	// Pagination
	// -------------------------------------------------------------------------
	const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

	// -------------------------------------------------------------------------
	// Deactivate dialog
	// -------------------------------------------------------------------------
	const [targetUser, setTargetUser] = useState<User | null>(null);
	const deactivate = useDeactivateUser();

	const handleDeactivateConfirm = async () => {
		if (!targetUser) return;
		await deactivate.mutateAsync(targetUser.id);
		setTargetUser(null);
	};

	// -------------------------------------------------------------------------
	// Data
	// -------------------------------------------------------------------------
	const queryParams = {
		page: paginationModel.page + 1,
		limit: paginationModel.pageSize,
		...(statusFilter && { status: statusFilter }),
	};

	const { data: usersResponse, isLoading } = useUsers(queryParams);
	const rows = usersResponse?.data ?? [];
	const rowCount = usersResponse?.metadata?.total ?? 0;

	// -------------------------------------------------------------------------
	// Columns
	// -------------------------------------------------------------------------
	const columns = useMemo<GridColDef<User>[]>(
		() => [
			{
				field: 'avatar',
				headerName: '',
				width: 56,
				sortable: false,
				renderCell: ({ row }) => (
					<Avatar src={row.avatarUrl ?? undefined} alt={getDisplayName(row)} sx={{ width: 32, height: 32, fontSize: '0.85rem' }}>
						{getDisplayName(row).charAt(0).toUpperCase()}
					</Avatar>
				),
			},
			{
				field: 'name',
				headerName: 'Name',
				flex: 1,
				minWidth: 160,
				renderCell: ({ row }) => (
					<Typography variant="body_smallRegular">{getDisplayName(row)}</Typography>
				),
			},
			{
				field: 'email',
				headerName: 'Email',
				flex: 1,
				minWidth: 200,
				renderCell: ({ row }) => (
					<Typography variant="body_smallRegular" color={row.email ? 'text.primary' : 'text.disabled'}>
						{row.email ?? '—'}
					</Typography>
				),
			},
			{
				field: 'role',
				headerName: 'Role',
				width: 100,
				renderCell: ({ row }) => getRoleChip(row.role),
			},
			{
				field: 'status',
				headerName: 'Status',
				width: 130,
				renderCell: ({ row }) => <StatusChip status={row.status} />,
			},
			{
				field: 'createdAt',
				headerName: 'Joined',
				width: 130,
				renderCell: ({ row }) => (
					<Typography variant="body_smallRegular">{dayjs(row.createdAt).format('MMM D, YYYY')}</Typography>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 96,
				sortable: false,
				renderCell: ({ row }) => (
					<Stack direction="row" alignItems="center">
						<Tooltip title="View detail">
							<IconButton size="small" onClick={() => navigate(ROUTES.adminUserDetail(row.id))} aria-label="view user">
								<OpenInNewIcon fontSize="small" />
							</IconButton>
						</Tooltip>

						{row.status === 'active' && row.clerkUserId !== clerkUser?.id && (
							<Tooltip title="Deactivate user">
								<IconButton size="small" color="error" onClick={() => setTargetUser(row)} aria-label="deactivate user">
									<BlockIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						)}
					</Stack>
				),
			},
		],
		[navigate, clerkUser?.id],
	);

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------
	return (
		<>
			<Stack spacing={3}>
				{/* Page header */}
				<Typography variant="title_medium">Users</Typography>

				{/* Filter bar */}
				<Paper sx={{ p: 2 }}>
					<Stack direction="row" gap={2} alignItems="center">
						<FormControl size="small" sx={{ minWidth: 160 }}>
							<InputLabel>Status</InputLabel>
							<Select
								value={statusFilter}
								label="Status"
								onChange={(e) => {
									setStatusFilter(e.target.value as UserStatus | '');
									setPaginationModel((prev) => ({ ...prev, page: 0 }));
								}}
							>
								<MenuItem value="">All Statuses</MenuItem>
								<MenuItem value="active">Active</MenuItem>
								<MenuItem value="de-active">Deactivated</MenuItem>
							</Select>
						</FormControl>

						{statusFilter && (
							<Button
								variant="outlined"
								size="small"
								color="inherit"
								onClick={() => {
									setStatusFilter('');
									setPaginationModel((prev) => ({ ...prev, page: 0 }));
								}}
							>
								Clear
							</Button>
						)}
					</Stack>
				</Paper>

				{/* DataGrid */}
				<Box sx={{ width: '100%' }}>
					<DataGrid
						rows={rows}
						columns={columns}
						rowCount={rowCount}
						loading={isLoading}
						paginationMode="server"
						paginationModel={paginationModel}
						onPaginationModelChange={setPaginationModel}
						pageSizeOptions={[10, 25, 50]}
						disableRowSelectionOnClick
						autoHeight
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 2,
							'& .MuiDataGrid-cell': { alignItems: 'center' },
						}}
					/>
				</Box>
			</Stack>

			{/* Deactivate confirm dialog */}
			<ConfirmDialog
				open={!!targetUser}
				title="Deactivate User"
				description={
					targetUser
						? `Are you sure you want to deactivate "${getDisplayName(targetUser)}"? They will lose access to the platform.`
						: ''
				}
				confirmLabel="Deactivate"
				confirmColor="error"
				isLoading={deactivate.isPending}
				onConfirm={handleDeactivateConfirm}
				onCancel={() => setTargetUser(null)}
			/>
		</>
	);
};
