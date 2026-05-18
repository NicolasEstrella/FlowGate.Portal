import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { dashboardRedirectGuard } from './core/guards/dashboard-redirect.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppRole } from './core/models/app-role';
import { AppShellComponent } from './layouts/app-shell.component';
import { AdminDashboardPageComponent } from './pages/dashboards/admin-dashboard-page.component';
import { DashboardRedirectPageComponent } from './pages/dashboards/dashboard-redirect-page.component';
import { UserDashboardPageComponent } from './pages/dashboards/user-dashboard-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { UnauthorizedPageComponent } from './pages/unauthorized/unauthorized-page.component';
import { RequestNewPageComponent } from './pages/requests/new/request-new-page.component';
import { MyRequestsPageComponent } from './pages/requests/list/my-requests-page.component';
import { RequestDetailPageComponent } from './pages/requests/detail/request-detail-page.component';
import { ApproverInboxPageComponent } from './pages/requests/inbox/approver-inbox-page.component';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginPageComponent,
		title: 'Entrar | FlowGate'
	},
	{
		path: 'unauthorized',
		component: UnauthorizedPageComponent,
		title: 'Acesso negado | FlowGate'
	},
	{
		path: 'workspace',
		component: AppShellComponent,
		canActivate: [authGuard],
		children: [
			{
				path: '',
				pathMatch: 'full',
				canActivate: [dashboardRedirectGuard],
				component: DashboardRedirectPageComponent
			},
			{
				path: 'admin',
				component: AdminDashboardPageComponent,
				canActivate: [roleGuard([AppRole.Admin])],
				title: 'Painel Admin | FlowGate'
			},
			{
				path: 'my-workspace',
				component: UserDashboardPageComponent,
				canActivate: [roleGuard([AppRole.StandardUser, AppRole.Admin, AppRole.Approver, AppRole.Finance, AppRole.Legal])],
				title: 'Meu Espaço | FlowGate'
			},
			{
				path: 'requests/new',
				component: RequestNewPageComponent,
				canActivate: [roleGuard([AppRole.StandardUser, AppRole.Admin])],
				title: 'Nova Solicitação | FlowGate'
			},
			{
				path: 'requests/:id',
				component: RequestDetailPageComponent,
				canActivate: [authGuard],
				title: 'Detalhe da Solicitação | FlowGate'
			},
			{
				path: 'requests',
				component: MyRequestsPageComponent,
				canActivate: [authGuard],
				title: 'Minhas Solicitações | FlowGate'
			},
			{
				path: 'approvals',
				component: ApproverInboxPageComponent,
				canActivate: [roleGuard([AppRole.Approver, AppRole.Finance, AppRole.Legal])],
				title: 'Aprovações | FlowGate'
			}
		]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'workspace'
	},
	{
		path: '**',
		component: NotFoundPageComponent,
		title: 'Página não encontrada | FlowGate'
	}
];

