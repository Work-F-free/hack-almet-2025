import {FC, memo} from 'react';
import {Alert, Button, Icon} from '@gravity-ui/uikit';
import {ArrowRotateRight} from '@gravity-ui/icons';

type Props = {
    total: number;
    allDoneOk: boolean;
    uploaded: number;
    error: number;
    uploading: number;
    onRetryAllErrors: () => void;
};

export const UploadStatusAlert: FC<Props> = memo(
    ({total, allDoneOk, uploaded, error, uploading, onRetryAllErrors}) => {
        if (total === 0) return null;

        if (allDoneOk) {
            return (
                <Alert
                    theme="success"
                    title="Загрузка завершена"
                    message="Все файлы успешно загружены."
                    view="filled"
                />
            );
        }

        return (
            <Alert
                theme={error > 0 ? 'warning' : 'info'}
                title="Статус загрузки"
                message={
                    <span>
                        {uploaded} успешно, {error} ошибок, {uploading} загружается
                    </span>
                }
                view="filled"
                layout="horizontal"
                actions={
                    error > 0 ? (
                        <Button onClick={onRetryAllErrors}>
                            Повторить <Icon data={ArrowRotateRight} size={18} />
                        </Button>
                    ) : undefined
                }
            />
        );
    },
);
