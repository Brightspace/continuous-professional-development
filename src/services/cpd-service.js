import { CpdRoutes } from '../helpers/cpdRoutes';
import { d2lfetch } from 'd2l-fetch/src/index';
import { dateParamString } from '../helpers/time-helper';
import fetchAuthFramed from 'd2l-fetch-auth/es6/d2lfetch-auth-framed';

d2lfetch.use({
	name: 'auth',
	fn: fetchAuthFramed,
	options: {
		enableTokenCache: true
	}
});

export class CpdService {

	static get CpdHomeLink() { return `${this.Host}/d2l/custom/cpd/main`; }
	static get Create() {
		return (type) => {
			return (object) => {
				return this.postJsonRequest(CpdRoutes.RelativePath(type), object);
			};
		};
	}
	static createMethod(method) {
		return this.postJsonRequest(CpdRoutes.RelativePath(CpdRoutes.Method), method);
	}
	static createQuestion(question) {
		return this.Create('question')(question);
	}
	static createRecord(record, files) {
		return this.postWithFilesRequest(CpdRoutes.RelativePath(CpdRoutes.Record), record, files);
	}
	static createSubject(subject) {
		return this.postJsonRequest(CpdRoutes.RelativePath(CpdRoutes.Subject), subject);
	}
	static get Delete() {
		return (type) => {
			return (id) => {
				const request = new Request(`${this.Host}${CpdRoutes.RelativePath(type)}/${id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type' : 'application/json'
					}
				});
				return d2lfetch.fetch(request);
			};
		};
	}
	static deleteMethod(methodId) {
		const request = new Request(`${this.Host}${CpdRoutes.RelativePath(CpdRoutes.Method)}/${methodId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(request);
	}
	static deleteQuestion(questionId) {
		const request = new Request(`${this.Host}${CpdRoutes.RelativePath(CpdRoutes.QuestionId(questionId))}`, {
			method: 'DELETE',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(request);
	}
	static deleteRecord(recordId) {
		const request = new Request(`${this.Host}${CpdRoutes.RelativePath(CpdRoutes.Record)}/${recordId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(request);
	}

	static dismissRecord(awardId) {
		const request = new Request(`${this.Host}${CpdRoutes.RelativePath(CpdRoutes.DismissRecord(awardId))}`, {
			method: 'POST',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(request);
	}

	static downloadBlob(blob, fileName) {
		let url;
		if (window.navigator.msSaveOrOpenBlob) {
			url = window.navigator.msSaveOrOpenBlob(blob, fileName);
			return;
		} else {
			url = window.URL.createObjectURL(blob);
		}
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}
	static async getAttachment(attachment) {
		let blob;
		if (attachment.href) {
			const path = `${this.Host}${attachment.href}`;
			const response = await d2lfetch.fetch(new Request(path));
			blob = await response.blob();
		} else if (attachment instanceof File) {
			blob = attachment;
		}
		this.downloadBlob(blob, attachment.name);
	}
	static getCsvExport(userId, fileName) {
		let path;
		if (userId) {
			path = `${this.Host}${CpdRoutes.RelativePath(CpdRoutes.UserCSVReport(userId))}`;
		} else {
			path = `${this.Host}${CpdRoutes.RelativePath(CpdRoutes.CSVReport)}`;
		}
		const request = new Request(path);
		return d2lfetch.fetch(request)
			.then(resp => resp.blob())
			.then(blob => {
				this.downloadBlob(blob, fileName);
			});
	}
	static getItems(type) {
		return this.getRequest(CpdRoutes.RelativePath(type));
	}
	static getJobTitleDefaults(page) {
		let url = CpdRoutes.RelativePath(this.JobTitle);
		const searchParams = new URLSearchParams();
		searchParams.append('pageNumber', page);
		url = url.concat(`?${searchParams.toString()}`);
		return this.getRequest(url);
	}
	static getMethods() {
		return this.getRequest(CpdRoutes.RelativePath(this.Method));
	}
	static getMyTeam(page, filters) {
		let url = CpdRoutes.RelativePath(this.Team);
		const searchParams = new URLSearchParams();
		searchParams.append('pageNumber', page);
		if (filters) {
			const { ManagingUserId, Name  } = filters;
			if (Name && Name.value) searchParams.append('searchTerm', Name.value);
			if (ManagingUserId) searchParams.append('managingUserId', ManagingUserId);
		}
		url = url.concat(`?${searchParams.toString()}`);
		return this.getRequest(url);
	}

	static getPendingRecords(page, filters) {
		let url = CpdRoutes.RelativePath(this.Pending);
		const searchParams = new URLSearchParams();
		searchParams.append('pageNumber', page);
		if (filters) {
			const { Name, StartDate, EndDate, Dismissed } = filters;
			if (Name && Name.value) searchParams.append('awardName', Name.value);
			if (StartDate && StartDate.value) searchParams.append('startDate', dateParamString(StartDate.value));
			if (EndDate && EndDate.value) searchParams.append('endDate', dateParamString(EndDate.value, true));
			if (Dismissed) searchParams.append('dismissed', true);
		}
		url = url.concat(`?${searchParams.toString()}`);
		return this.getRequest(url);
	}

	static getProgress(userId, filters) {
		let url = userId ? CpdRoutes.RelativePath(CpdRoutes.UserProgress(userId)) : CpdRoutes.RelativePath(CpdRoutes.Progress);
		if (filters) {
			const searchParams = new URLSearchParams();
			const { Subject, Method, Name, StartDate, EndDate } = filters;
			if (Subject && Subject.value && Subject.enabled) searchParams.append('subject', Subject.value);
			if (Method && Method.value && Method.enabled) searchParams.append('method', Method.value);
			if (Name && Name.value) searchParams.append('recordName', Name.value);
			if (StartDate && StartDate.value) searchParams.append('startDate', dateParamString(StartDate.value));
			if (EndDate && EndDate.value) searchParams.append('endDate', dateParamString(EndDate.value, true));
			url = url.concat(`?${searchParams.toString()}`);
		}
		return this.getRequest(url);
	}

	static getQuestions() {
		return this.getRequest(CpdRoutes.RelativePath(CpdRoutes.Question));
	}
	static getRecord(recordId) {
		const base_path = `${CpdRoutes.RelativePath(this.Record)}/${recordId}`;
		return this.getRequest(base_path)
			.then(body => {
				if (body.Attachments) {
					body.Attachments.Files = body.Attachments.Files.map(file => {
						return {
							id: file.Id,
							name: file.Name,
							size: file.Size,
							href: `${file.Href}`
						};
					});
				}
				return body;
			});
	}
	static getRecordSummary(page, viewUserId, filters) {
		let url = viewUserId ? CpdRoutes.RelativePath(`${CpdRoutes.UserRecord}/${viewUserId}`) : CpdRoutes.RelativePath(this.Record) ;
		const searchParams = new URLSearchParams();
		searchParams.append('pageNumber', page);

		if (filters) {
			const { Subject, Method, Name, StartDate, EndDate } = filters;
			if (Subject && Subject.value && Subject.enabled) searchParams.append('subject', Subject.value);
			if (Method && Method.value && Method.enabled) searchParams.append('method', Method.value);
			if (Name && Name.value) searchParams.append('recordName', Name.value);
			if (StartDate && StartDate.value) searchParams.append('startDate', dateParamString(StartDate.value));
			if (EndDate && EndDate.value) searchParams.append('endDate', dateParamString(EndDate.value, true));
		}

		url = url.concat(`?${searchParams.toString()}`);
		return this.getRequest(url);
	}
	static getRequest(base_path) {
		const getRequest = new Request(`${this.Host}${base_path}`, {
			method: 'GET',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(getRequest).then(r => r.json());
	}
	static getSubjects() {
		const base_path = '/d2l/api/customization/cpd/1.0/subject';
		return this.getRequest(base_path);
	}
	static getSubjectTargets(jobTitle) {
		if (!jobTitle) {
			return this.getRequest(CpdRoutes.RelativePath(CpdRoutes.UserTarget));
		}
		return this.getRequest(CpdRoutes.RelativePath(CpdRoutes.JobTarget(jobTitle)));
	}
	static getTargetRecords(userId, filters) {
		let url = userId ? CpdRoutes.RelativePath(CpdRoutes.UserReportRecords(userId)) : CpdRoutes.RelativePath(CpdRoutes.ReportRecords);
		if (filters) {
			const searchParams = new URLSearchParams();
			const { Subject, Method, Name, StartDate, EndDate } = filters;
			if (Subject && Subject.value) searchParams.append('subject', Subject.value);
			if (Method && Method.value) searchParams.append('method', Method.value);
			if (Name && Name.value) searchParams.append('recordName', Name.value);
			if (StartDate && StartDate.value) searchParams.append('startDate', StartDate.value);
			if (EndDate && EndDate.value) searchParams.append('endDate', EndDate.value);
			url = url.concat(`?${searchParams.toString()}`);
		}
		return this.getRequest(url);
	}
	static getTypes() {
		return [ {
			Id: 1,
			Name: 'Structured'
		},
		{
			Id: 0,
			Name: 'Unstructured'
		}];
	}
	static getUserInfo(userId) {
		if (!userId) {
			return this.getRequest(CpdRoutes.RelativePath(CpdRoutes.DisplayName));
		}
		return this.getRequest(CpdRoutes.RelativePath(CpdRoutes.UserDisplayName(userId)));
	}
	static getWhoAmI() {
		return this.getRequest(CpdRoutes.WhoAmI);
	}
	static get Host() { return window.data.fraSettings.valenceHost; }
	static get Job() { return 'target/job'; }
	static get JobTitle() { return 'target/jobtitles'; }
	static get Method() { return 'method'; }
	static get Pending() { return 'pending'; }

	static postJsonRequest(base_path, object) {
		const postRequest = new Request(`${this.Host}${base_path}`, {
			method: 'POST',
			headers: {
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify(object)
		});
		return d2lfetch.fetch(postRequest);
	}
	static postWithFilesRequest(base_path, object, files) {
		const data = new FormData();
		data.append('record', JSON.stringify(object));
		for (const file of files) {
			data.append('file', file, file.name);
		}
		const postRequest = new Request(`${this.Host}${base_path}`, {
			method: 'POST',
			body: data
		});
		return d2lfetch.fetch(postRequest);
	}
	static printRecordLink(filters, userId) {
		let url = userId ? CpdRoutes.UserReport(userId) : CpdRoutes.Report;
		if (filters) {
			const searchParams = new URLSearchParams();
			const { Subject, Method, Name, StartDate, EndDate } = filters;
			if (Subject && Subject.value && Subject.enabled) searchParams.append('subject', Subject.value);
			if (Method && Method.value && Method.enabled) searchParams.append('method', Method.value);
			if (Name && Name.value) searchParams.append('recordName', Name.value);
			if (StartDate && StartDate.value) searchParams.append('startDate', dateParamString(StartDate.value));
			if (EndDate && EndDate.value) searchParams.append('endDate', dateParamString(EndDate.value, true));
			url = url.concat(`?${searchParams.toString()}`);
		}
		return `${CpdRoutes.Host}${url}`;
	}
	static putJsonRequest(base_path, object) {
		const putRequest = new Request(`${this.Host}${base_path}`, {
			method: 'PUT',
			headers: {
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify(object)
		});
		return d2lfetch.fetch(putRequest);
	}
	static putWithFilesRequest(base_path, object, files, removedFiles) {
		const data = new FormData();
		data.append('record', JSON.stringify(object));
		data.append('deletedFiles', JSON.stringify(removedFiles));
		for (const file of files) {
			data.append('file', file, file.name);
		}
		const postRequest = new Request(`${this.Host}${base_path}`, {
			method: 'PUT',
			body: data
		});
		return d2lfetch.fetch(postRequest);
	}
	static get Record() { return 'record'; }
	static restoreRecord(awardId) {
		const request = new Request(`${this.Host}${CpdRoutes.RelativePath(CpdRoutes.DismissRecord(awardId))}`, {
			method: 'DELETE',
			headers: {
				'Content-Type' : 'application/json'
			}
		});
		return d2lfetch.fetch(request);
	}
	static get Subject() { return 'subject'; }
	static get Target() {return 'target';}
	static get Team() { return 'team'; }
	static get Update() {
		return (type) => {
			return (id) => {
				return (object) => {
					return this.putJsonRequest(`${CpdRoutes.RelativePath(CpdRoutes.ItemId(type, id))}`, object);
				};
			};
		};
	}
	static updateItemSortOrder(type, id, sortOrder) {
		return this.putJsonRequest(`${CpdRoutes.RelativePath(CpdRoutes.ItemSortOrder(type, id))}`, {
			NewSortOrder: sortOrder
		});
	}
	static updateQuestion(questionId, question) {
		return this.putJsonRequest(`${CpdRoutes.RelativePath(CpdRoutes.QuestionId(questionId))}`, question);
	}

	static updateRecord(recordId, record, files, removedFiles) {
		return this.putWithFilesRequest(`${CpdRoutes.RelativePath(this.Record)}/${recordId}`, record, files, removedFiles);
	}

	static updateSubject(subjectId, subject) {
		return this.postJsonRequest(`${CpdRoutes.RelativePath(this.Subject)}/${subjectId}}`, subject);
	}

	static updateTarget(jobTitle, target) {

		if (jobTitle) {
			return this.postJsonRequest(CpdRoutes.RelativePath(CpdRoutes.JobTarget(jobTitle)), target);
		} else {
			return this.postJsonRequest(CpdRoutes.RelativePath(CpdRoutes.UserTarget), target);
		}
	}

	static updateTargetDate(date, jobTitle) {
		return this.postJsonRequest(jobTitle ? CpdRoutes.RelativePath(CpdRoutes.JobTargetStartDate(jobTitle)) : CpdRoutes.RelativePath(CpdRoutes.UserTargetStartDate), date);
	}

}
