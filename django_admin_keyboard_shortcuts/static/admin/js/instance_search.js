'use strict';
{
    const $ = django.jQuery;

    $(document).ready(function() {
        const hideSelectBox = (selectBox) => $(selectBox).next('.select2-container').hide();
        const showSelectBox = (selectBox) => $(selectBox).next('.select2-container').show();
        const openSelectBox = (selectBox) => $(selectBox).select2('open');
        const clearSelectBox = (selectBox) => $(selectBox).val(null).trigger('change');

        django.SelectBoxUtils = {
            hide: hideSelectBox,
            show: showSelectBox,
            open: openSelectBox,
            clear: clearSelectBox
        }

        const $dialog = $('#instance-list-dialog');
        const modelSelectBoxContainer = '#shortcuts-model-select-container';
        const modelSelectBox = '#shortcuts-model-select';
        const instanceSelectBoxContainer = '#shortcuts-instance-select-container';
        const instanceSelectBox = '#shortcuts-instance-select';
        const $modelSelectBox = $(modelSelectBox).select2({dropdownParent: $(modelSelectBoxContainer)});

        let appLabel, modelName;
        const $instanceSelectBox = $(instanceSelectBox).select2({
            ajax: {
                data: (params) => {
                    return {
                        term: params.term,
                        page: params.page,
                        app_label: appLabel,
                        model_name: modelName,
                    };
                },
                cache: true,
                delay: 250
            },
            dropdownParent: $(instanceSelectBoxContainer),
        });

        $modelSelectBox.on('select2:select', function() {
            appLabel = $(this).find(':selected').parent('optgroup').data('value');
            modelName = $(this).val();
            hideSelectBox(this);
            showSelectBox(instanceSelectBox);
            openSelectBox(instanceSelectBox);
        });
        $instanceSelectBox.on('select2:select', function() {
            const selectedOptionData = $(this).select2('data')[0];
            const changeUrl = selectedOptionData.admin_url;
            window.location.href = changeUrl;
        });
        $dialog.on('close', function() {
            hideSelectBox(instanceSelectBox);
            clearSelectBox(instanceSelectBox);
            clearSelectBox(modelSelectBox);
        });
    });
}
